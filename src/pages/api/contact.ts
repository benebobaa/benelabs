import type { APIRoute } from 'astro';
import { createHash, randomUUID } from 'crypto';

export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY as string | undefined;
const RESEND_FROM_EMAIL = import.meta.env.RESEND_FROM_EMAIL as string | undefined;
const RESEND_TO_EMAIL = import.meta.env.RESEND_TO_EMAIL as string | undefined;
const POSTHOG_HOST = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com';
const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
const CONSENT_REQUIRED = (import.meta.env.PUBLIC_POSTHOG_CONSENT_REQUIRED ?? 'true') === 'true';

const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const parseBody = async (request: Request): Promise<Record<string, string>> => {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const data = await request.json();
      if (!data || typeof data !== 'object') return {};
      return Object.entries(data as Record<string, unknown>).reduce((acc, [key, value]) => {
        const normalized = normalize(value);
        if (normalized) acc[key] = normalized;
        return acc;
      }, {} as Record<string, string>);
    } catch {
      return {};
    }
  }
  if (contentType.includes('form')) {
    const formData = await request.formData();
    const entries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string' && value.trim()) {
        entries[key] = value.trim();
      }
    });
    return entries;
  }
  return {};
};

const hashEmail = (email: string) =>
  createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

const capturePosthog = async (
  event: string,
  distinctId: string,
  properties: Record<string, unknown>
) => {
  if (!POSTHOG_KEY) return;
  const url = `${POSTHOG_HOST.replace(/\/$/, '')}/capture/`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties,
      }),
    });
  } catch {
    // Intentionally ignore analytics failures.
  }
};

const prefersJson = (request: Request) =>
  (request.headers.get('accept') ?? '').includes('application/json');

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const htmlResponse = (status: number, title: string, message: string) =>
  new Response(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body>
        <main style="font-family: sans-serif; padding: 24px; line-height: 1.5;">
          <h1>${title}</h1>
          <p>${message}</p>
          <p><a href="/contact">Back to contact</a></p>
        </main>
      </body>
    </html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !RESEND_TO_EMAIL) {
    const payload = { ok: false, error: 'Email service not configured.' };
    return prefersJson(request) ? jsonResponse(500, payload) : htmlResponse(500, 'Setup error', payload.error);
  }

  const data = await parseBody(request);
  const name = normalize(data.name);
  const email = normalize(data.email).toLowerCase();
  const details = normalize(data.details);
  const distinctId = normalize(data.distinctId || data.distinct_id || data.posthog_distinct_id);

  if (!email || !email.includes('@') || !details) {
    const payload = { ok: false, error: 'Please provide a valid email and project details.' };
    return prefersJson(request) ? jsonResponse(400, payload) : htmlResponse(400, 'Missing details', payload.error);
  }

  const emailHash = hashEmail(email);
  const safeDistinctId = distinctId || emailHash || randomUUID();
  const allowAnalytics = Boolean(POSTHOG_KEY);

  if (allowAnalytics) {
    await capturePosthog('contact_form_received', safeDistinctId, {
      email_hash: emailHash,
      name_provided: Boolean(name),
      message_length: details.length,
      source: 'contact_form',
    });
  }

  const recipients = RESEND_TO_EMAIL.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const subject = name ? `New consultation request from ${name}` : 'New consultation request';
  const referer = request.headers.get('referer') ?? 'unknown';
  const text = [
    `Name: ${name || 'Not provided'}`,
    `Email: ${email}`,
    '',
    details,
    '',
    `Referrer: ${referer}`,
  ].join('\n');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: recipients,
      subject,
      text,
      reply_to: email,
    }),
  });

  if (!resendResponse.ok) {
    if (allowAnalytics) {
      await capturePosthog('contact_email_failed', safeDistinctId, {
        email_hash: emailHash,
        provider: 'resend',
      });
    }
    const payload = { ok: false, error: 'We could not send your message. Please try again.' };
    return prefersJson(request) ? jsonResponse(502, payload) : htmlResponse(502, 'Message failed', payload.error);
  }

  if (allowAnalytics) {
    await capturePosthog('contact_email_sent', safeDistinctId, {
      email_hash: emailHash,
      provider: 'resend',
    });
  }

  const payload = { ok: true };
  return prefersJson(request)
    ? jsonResponse(200, payload)
    : htmlResponse(200, 'Message sent', 'Thanks for reaching out. We will reply within two business days.');
};

export const GET: APIRoute = async ({ request }) => {
  const payload = { ok: false, error: 'Method not allowed.' };
  return prefersJson(request)
    ? jsonResponse(405, payload)
    : htmlResponse(405, 'Method not allowed', 'Please submit the contact form to reach us.');
};
