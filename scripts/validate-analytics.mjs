import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';

// Required Mixpanel events for full funnel tracking
const requiredEvents = [
  'page_view',
  'content_list_view',
  'content_view',
  'content_engaged',
  'content_completed',
  'cta_click',
  'nav_click',
  'contact_email_click',
  'project_link_click',
  'project_video_play',
  'outbound_link_click',
  'contact_form_start',
  'contact_form_submit',
  'contact_form_received',
  'contact_email_sent',
  'contact_email_failed',
  'error',
];

// Required server-side events
const serverRequiredEvents = [
  'contact_form_received',
  'contact_email_sent',
  'contact_email_failed',
];

const checkTracking = async () => {
  console.log('🔍 Validating Mixpanel analytics implementation...\n');

  // Check client-side tracking
  const clientFiles = await glob('src/**/*.{astro,ts,js}');

  if (clientFiles.length === 0) {
    console.error('❌ No client files found in src/');
    process.exit(1);
  }

  const clientContent = clientFiles.map((f) => {
    try {
      return readFileSync(f, 'utf-8');
    } catch (err) {
      console.warn(`⚠️  Could not read file: ${f}`);
      return '';
    }
  }).join('\n');

  const missingClientEvents = requiredEvents.filter((event) => {
    // Check for event string in content
    const hasSingleQuote = clientContent.includes(`'${event}'`);
    const hasDoubleQuote = clientContent.includes(`"${event}"`);
    return !hasSingleQuote && !hasDoubleQuote;
  });

  // Check server-side tracking
  const serverFile = 'src/pages/api/contact.ts';
  let serverContent = '';
  if (existsSync(serverFile)) {
    serverContent = readFileSync(serverFile, 'utf-8');
  }

  const missingServerEvents = serverRequiredEvents.filter((event) => {
    const hasSingleQuote = serverContent.includes(`'${event}'`);
    const hasDoubleQuote = serverContent.includes(`"${event}"`);
    return !hasSingleQuote && !hasDoubleQuote;
  });

  // Report results
  let hasErrors = false;

  if (missingClientEvents.length > 0) {
    hasErrors = true;
    console.error('❌ Missing client-side events:');
    missingClientEvents.forEach((event) => console.error(`   - ${event}`));
    console.error('');
  } else {
    console.log('✅ All client-side events are implemented');
  }

  if (missingServerEvents.length > 0) {
    hasErrors = true;
    console.error('❌ Missing server-side events:');
    missingServerEvents.forEach((event) => console.error(`   - ${event}`));
    console.error('');
  } else if (serverContent) {
    console.log('✅ All server-side events are implemented');
  }

  // Check for required data attributes
  const requiredAttributes = [
    'data-analytics',
    'data-label',
    'data-analytics-form',
    'data-analytics-content',
    'data-analytics-slug',
    'data-analytics-title',
    'data-analytics-list',
    'data-analytics-video',
    'data-analytics-distinct-id',
  ];

  const missingAttributes = requiredAttributes.filter((attr) => {
    return !clientContent.includes(attr);
  });

  if (missingAttributes.length > 0) {
    hasErrors = true;
    console.error('❌ Missing data attributes:');
    missingAttributes.forEach((attr) => console.error(`   - ${attr}`));
    console.error('');
  } else {
    console.log('✅ All required data attributes are present');
  }

  // Check for Mixpanel component
  if (clientContent.includes('mixpanel-browser')) {
    console.log('✅ Mixpanel client SDK is imported');
  } else {
    hasErrors = true;
    console.error('❌ Mixpanel client SDK not found');
  }

  if (clientContent.includes('Mixpanel') || clientContent.includes('mixpanel-browser')) {
    console.log('✅ Mixpanel component exists');
  } else {
    hasErrors = true;
    console.error('❌ Mixpanel component not found');
  }

  // Check for identity management
  if (clientContent.includes('__mixpanelDistinctId') || clientContent.includes('mixpanelDistinctId')) {
    console.log('✅ Identity management is implemented');
  } else {
    console.warn('⚠️  Identity management (__mixpanelDistinctId) not found');
  }

  // Check for UTM tracking
  if (
    clientContent.includes('utm_source') ||
    clientContent.includes('UTM_SOURCE') ||
    clientContent.includes('gclid')
  ) {
    console.log('✅ UTM parameter tracking is implemented');
  } else {
    console.warn('⚠️  UTM parameter tracking not found');
  }

  // Check for session replay support
  if (
    clientContent.includes('record_sessions_percent') ||
    clientContent.includes('SESSION_REPLAY')
  ) {
    console.log('✅ Session replay configuration is present');
  } else {
    console.warn('⚠️  Session replay configuration not found');
  }

  console.log('');

  if (hasErrors) {
    console.error('❌ Analytics validation failed. Please implement missing events and attributes.');
    process.exit(1);
  }

  console.log('🎉 All analytics validation checks passed!\n');
  console.log(`Summary:`);
  console.log(`   - ${requiredEvents.length} client-side events tracked`);
  console.log(`   - ${serverRequiredEvents.length} server-side events tracked`);
  console.log(`   - ${requiredAttributes.length} data attributes used`);
  console.log('');
  console.log('✅ Analytics implementation is complete and ready for production.');
};

checkTracking();
