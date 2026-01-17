# Mixpanel Dashboard Setup

This document provides guidance for setting up Mixpanel dashboards to monitor the Benelabs website analytics and funnel tracking.

## Quick Setup

1. Navigate to [Mixpanel](https://mixpanel.com/settings/project)
2. Select your project (use token from `.env` for identification)
3. Create the funnels and charts documented below

---

## Core Funnels to Create

### 1. Contact Form Funnel

**Purpose:** Track conversion from visitor to qualified lead

**Steps:**
1. Funnel name: `Contact Form Conversion`
2. Add events in order:
   - `page_view` (filter: `path` = `/contact`)
   - `contact_form_start`
   - `contact_form_submit`
   - `contact_form_received` (server event)
   - `contact_email_sent` (server event)

**Key Metrics to Monitor:**
- **Form start rate:** `contact_form_start` / `page_view`
- **Submit rate:** `contact_form_submit` / `contact_form_start`
- **Server receipt rate:** `contact_form_received` / `contact_form_submit`
- **Email delivery rate:** `contact_email_sent` / `contact_form_received`
- **Total conversion rate:** `contact_email_sent` / `page_view`

**Alerts to Set:**
- If `contact_email_failed` > 0 in last 24 hours → Critical
- If `contact_email_sent` = 0 in last 24 hours but submits > 5 → Critical

**Breakdowns to Add:**
- By `first_touch_utm_source` (Acquisition channel)
- By `first_touch_utm_medium` (Marketing medium)
- By `landing_referrer` (Traffic source)

---

### 2. Content Engagement Funnel

**Purpose:** Measure how deeply users consume blog posts and project pages

**Steps:**
1. Funnel name: `Content Engagement`
2. Add events in order:
   - `content_view`
   - `content_engaged` (scroll >= 50%)
   - `content_completed` (scroll >= 90%)

**Key Metrics to Monitor:**
- **Engagement rate:** `content_engaged` / `content_view`
- **Completion rate:** `content_completed` / `content_view`
- **Drop-off points:** Where users exit in the funnel

**Breakdowns to Add:**
- By `type` (blog vs project)
- By `slug` (Individual content performance)
- By `first_touch_utm_source` (Traffic source engagement)
- By `landing_path` (Which page brought them to content)

**Insights to Look For:**
- High engagement but low completion → Content is valuable but long
- Low engagement → Content title/summary not compelling
- High completion → Strong content worth syndicating

---

### 3. CTA Performance Funnel

**Purpose:** Track effectiveness of primary call-to-action buttons across the site

**Steps:**
1. Funnel name: `CTA Performance`
2. Use `cta_click` event only
3. Group by `label` property

**Key Metrics to Monitor:**
- **Total clicks:** Sum of all `cta_click` events
- **Top performing CTAs:** Click count by `label`
- **CTA position performance:** Group by page path
- **CTR by traffic source:** Breakdown by `utm_source`

**Common Labels to Watch:**
- `home_explore_projects`
- `home_book_consultation`
- `home_view_projects`
- `home_view_blog`
- `home_book_call`
- `header_book_consultation`
- `mobile_book_consultation`
- `blog_follow_medium`

**A/B Testing Ideas:**
- Compare "Book a consultation" vs "Book a free consultation"
- Compare "Explore projects" vs "View case studies"
- Test button color variations (track via label changes)

---

## Key Insights Dashboards

### 1. Traffic Sources Dashboard

**Charts to Create:**

**Acquisition Overview (Line Chart)**
- Metric: Total unique users
- Breakdown by: `first_touch_utm_source`
- Time range: Last 30 days

**Campaign Performance (Bar Chart)**
- Metric: Unique users
- Breakdown by: `first_touch_utm_campaign`
- Time range: Last 7 days

**Channel Attribution (Pie Chart)**
- Metric: Total `contact_form_received` events
- Breakdown by: `first_touch_utm_medium`

**Questions to Answer:**
- Which traffic sources bring the most qualified leads?
- Are paid campaigns (cpc) outperforming organic?
- Which acquisition channel has highest contact conversion rate?
- How do first-touch vs last-touch attribution differ?

---

### 2. Content Performance Dashboard

**Charts to Create:**

**Top Content (Table)**
- Metric: Total `content_view` events
- Group by: `slug`, `type`
- Time range: Last 30 days
- Columns: View count, engagement rate, completion rate

**Engagement Quality (Bar Chart)**
- Metric: `content_engaged` / `content_view` (percentage)
- Breakdown by: `type` (blog vs project)
- Time range: Last 30 days

**Reading Depth (Histogram)**
- Metric: Distribution of `content_completed` events
- Breakdown by: None (aggregate view)
- Time range: Last 30 days

**Questions to Answer:**
- Which blog posts drive the most qualified leads (track via downstream contact forms)?
- Do users engage more with projects or blog posts?
- What content characteristics correlate with high completion rates?
- Should we invest more in projects or blog content?

---

### 3. User Journey Dashboard

**Charts to Create:**

**Page Flow (Funnels)**
- Funnel: `Home` → `Projects` → `Project Detail` → `Contact`
- Funnel: `Home` → `Blog` → `Blog Post` → `Contact`

**Entry Points (Bar Chart)**
- Metric: Total `page_view` events
- Breakdown by: `landing_path`
- Time range: Last 30 days

**Exit Pages (Bar Chart)**
- Metric: Total page views (use `page_view` count by path)
- Sort by: Highest bounce rate (use exit tracking or estimate)
- Time range: Last 30 days

**Questions to Answer:**
- What are the most common user paths through the site?
- Which pages are drop-off points in the journey?
- Where do users enter the site most frequently?
- Which pages have highest bounce rates?

---

## Email Delivery Monitoring

### Email Success Rate

**Insight to Create:**
- Name: `Email Delivery Success Rate`
- Formula: `count(contact_email_sent) / (count(contact_email_sent) + count(contact_email_failed)) * 100`
- Time range: Last 7 days, Last 30 days

**Alerts:**
- If success rate < 95% in last 24 hours → Warning
- If success rate < 90% in last 1 hour → Critical

**Error Analysis:**
- Create an insight to group `contact_email_failed` events by `error` property
- Look for common error patterns (timeout, invalid email, API limits)

---

## Technical Health Dashboard

### 1. Error Tracking

**Chart to Create:**
- Name: `JavaScript Errors`
- Metric: Total `error` events
- Breakdown by: `message` (group top 10)
- Time range: Last 24 hours, Last 7 days

**Alerts:**
- If `error` events > 10 in 1 hour → Warning
- If `error` events > 50 in 24 hours → Critical

### 2. Session Replay Quality

**Chart to Create:**
- Name: `Session Replay Capture Rate`
- Metric: Total sessions with replay enabled
- Breakdown by: `session_replay_enabled` property
- Time range: Last 30 days

**Configuration Verification:**
- Confirm `session_replay_enabled = true` for expected percentage of sessions
- Current sampling rate: 0% (default), can be increased via env vars

---

## Custom Events Reference

| Event Name | Category | Key Properties | Use Case |
|-------------|----------|-----------------|------------|
| `page_view` | Navigation | `path`, `title`, `referrer` | Track every page load |
| `content_list_view` | Content | `list` | Blog/project listing views |
| `content_view` | Content | `type`, `slug`, `title` | Individual content views |
| `content_engaged` | Engagement | `type`, `slug`, `title`, `scroll` | User scrolled to 50% |
| `content_completed` | Engagement | `type`, `slug`, `title`, `scroll` | User scrolled to 90% |
| `cta_click` | Interaction | `label`, `href` | Primary button clicks |
| `nav_click` | Navigation | `label`, `href` | Navigation link clicks |
| `contact_email_click` | Interaction | `href` | Email link clicks |
| `project_link_click` | Interaction | `label`, `href` | Project demo/live link clicks |
| `project_video_play` | Interaction | `type`, `slug`, `title` | Video play events |
| `outbound_link_click` | Navigation | `href`, `label` | External domain clicks |
| `contact_form_start` | Form | `form` | User started filling contact form |
| `contact_form_submit` | Form | `form` | User submitted contact form |
| `contact_form_received` | Server | `email_hash`, `name_provided`, `message_length`, `source` | Server received form |
| `contact_email_sent` | Server | `email_hash`, `provider` | Email sent successfully |
| `contact_email_failed` | Server | `email_hash`, `provider`, `error` | Email send failed |
| `error` | Technical | `message`, `filename`, `lineno`, `colno`, `url`, `user_agent` | JavaScript errors |

---

## Super Properties Reference

These properties are automatically included with all events:

| Property | Category | Description |
|-----------|----------|-------------|
| `landing_path` | Attribution | First page user visited |
| `landing_referrer` | Attribution | First page referrer |
| `utm_source` | Attribution | Traffic source (google, facebook, etc.) |
| `utm_medium` | Attribution | Marketing medium (cpc, email, social) |
| `utm_campaign` | Attribution | Campaign name |
| `utm_term` | Attribution | Search terms |
| `utm_content` | Attribution | Ad content identifier |
| `gclid` | Attribution | Google Click ID |
| `fbclid` | Attribution | Facebook Click ID |
| `first_touch_utm_source` | Attribution | First traffic source |
| `first_touch_utm_medium` | Attribution | First marketing medium |
| `first_touch_utm_campaign` | Attribution | First campaign name |
| `first_touch_utm_term` | Attribution | First search term |
| `first_touch_utm_content` | Attribution | First ad content |
| `session_replay_enabled` | Configuration | Whether session replay is active for user |

---

## Debugging Tips

### Using Debug Mode

When investigating analytics issues:

1. Add `?debug_mixpanel` to any page URL
2. Open browser console (F12)
3. Look for `[Mixpanel Debug]` messages
4. Check that events fire with expected properties
5. Verify distinct ID matches between client and server

### Common Issues

**Events Not Firing:**
- Check if `PUBLIC_MIXPANEL_TOKEN` is set in `.env`
- Verify ad blockers are not blocking Mixpanel (use browser dev tools Network tab)
- Check console for initialization errors

**Identity Mismatch:**
- Verify `window.__mixpanelDistinctId` is set on page load
- Check contact form hidden input `distinctId` has value
- Confirm server receives and uses the same `distinct_id`

**Missing Properties:**
- Verify data attributes (`data-analytics`, `data-label`) are present
- Check that `data-analytics-content` has `data-slug` and `data-title`
- Ensure server-side tracking reads form fields correctly

---

## Next Steps

1. **Create funnels:** Set up the three core funnels (Contact, Engagement, CTA)
2. **Build dashboards:** Create insight dashboards for traffic, content, and user journeys
3. **Set alerts:** Configure alerts for email delivery failures and error spikes
4. **Monitor weekly:** Review performance metrics and optimize based on insights
5. **A/B test:** Use CTA performance data to test button copy variations

---

## Additional Resources

- [Mixpanel Documentation](https://docs.mixpanel.com/)
- [Mixpanel JavaScript SDK](https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript)
- [Mixpanel Node.js SDK](https://docs.mixpanel.com/docs/tracking-methods/sdks/nodejs)
- [Project repo](https://github.com/mixpanel/mixpanel-js)
