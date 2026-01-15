import type { APIRoute } from 'astro';
import { createHash, randomUUID } from 'crypto';

export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY as string | undefined;
const RESEND_FROM_EMAIL = import.meta.env.RESEND_FROM_EMAIL as string | undefined;
const RESEND_TO_EMAIL = import.meta.env.RESEND_TO_EMAIL as string | undefined;
const POSTHOG_HOST = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com';
const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;

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

  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Consultation Request</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #141414; background-color: #f7f6f2; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .header { background: #1e5fa2; color: #ffffff; padding: 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .field { margin-bottom: 20px; }
          .label { font-size: 12px; text-transform: uppercase; color: #6b6b6b; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.05em; }
          .value { font-size: 16px; color: #141414; white-space: pre-wrap; }
          .footer { background: #f7f6f2; padding: 20px; text-align: center; font-size: 12px; color: #6b6b6b; border-top: 1px solid #e6e2da; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Benelabs Inquiry</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">Project Details</div>
              <div class="value">${details.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Referrer</div>
              <div class="value">${referer}</div>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Benelabs. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const userHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>We received your message</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #141414; background-color: #f7f6f2; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .header { background: #ffffff; color: #141414; padding: 30px 20px 10px; text-align: center; border-bottom: 1px solid #f0f0f0; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #1e5fa2; }
          .content { padding: 30px 20px; }
          .message { font-size: 16px; color: #4c4c4c; margin-bottom: 24px; }
          .cta { display: inline-block; padding: 12px 24px; background-color: #1e5fa2; color: #ffffff; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 15px; }
          .footer { background: #f7f6f2; padding: 20px; text-align: center; font-size: 12px; color: #6b6b6b; border-top: 1px solid #e6e2da; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Benelabs</h1>
          </div>
          <div class="content">
            <p class="message">Hi ${name || 'there'},</p>
            <p class="message">Thanks for reaching out! We've received your message about your project.</p>
            <p class="message">Our team will review the details and get back to you within two business days. We're excited to learn more about what you're building.</p>
            <p class="message" style="margin-top: 32px; text-align: center;">
              <a href="https://benelabs.tech/projects" class="cta">Check out our latest work</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Benelabs. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const sendEmail = (to: string | string[], subject: string, html: string, replyTo?: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html,
        reply_to: replyTo,
      }),
    });

  const [adminResult, userResult] = await Promise.allSettled([
    sendEmail(recipients, subject, adminHtml, email),
    sendEmail(email, 'Received: Your inquiry to Benelabs', userHtml),
  ]);

  const adminResponse = adminResult.status === 'fulfilled' ? adminResult.value : null;

  if (!adminResponse || !adminResponse.ok) {
    const errorData = await adminResponse?.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Resend API Error (Admin):', JSON.stringify(errorData, null, 2));

    if (allowAnalytics) {
      await capturePosthog('contact_email_failed', safeDistinctId, {
        email_hash: emailHash,
        provider: 'resend',
        error: errorData
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

  if (prefersJson(request)) {
    return jsonResponse(200, payload);
  }

  // Redirect to success page for form submissions
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/contact/success',
    },
  });
};

export const GET: APIRoute = async ({ request }) => {
  const payload = { ok: false, error: 'Method not allowed.' };
  return prefersJson(request)
    ? jsonResponse(405, payload)
    : htmlResponse(405, 'Method not allowed', 'Please submit the contact form to reach us.');
};
