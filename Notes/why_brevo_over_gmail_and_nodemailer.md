# Why Brevo over Gmail + Nodemailer and Other Email Services

## 1. The Core Problem: Nodemailer + Gmail SMTP on Render

When deploying a Node.js backend to **Render's Free Tier** (or similar platforms like AWS EC2 default, Heroku free, etc.), traditional SMTP connections fail.

- **Port Blocking:** Render strictly blocks outbound traffic on standard SMTP ports (`25`, `465`, and `587`) to prevent spam.
- **The Error:** Attempting to send emails using `nodemailer` connected to `smtp.gmail.com` via Port 587 results in connection timeouts (`ETIMEDOUT`).
- **Gmail Limitations:** Gmail has a daily sending cap (500/day) and can temporarily or permanently ban accounts if flagged for sending automated emails.

---

## 2. The Problem with Other Popular Services (Resend, SendGrid, Mailgun, Mailtrap)

Most production-grade email services fail under two specific constraints: **no custom domain** and **sending to any recipient**.

- **Custom Domain Requirement:** Services like Resend, Mailgun, AWS SES, and Mailtrap Email Sending require you to own a custom domain and verify DNS records (SPF, DKIM, DMARC). Without a domain, these services lock your account in **Sandbox Mode**, restricting delivery **only to your own email address**.
- **Mailtrap Email Testing:** Mailtrap's testing tool captures outgoing emails inside a fake web dashboard inbox—it does **not** deliver emails to actual recipients.

---

## 3. The Solution: Why Brevo (Sendinblue)?

Brevo resolves all hosting, domain, and delivery constraints for free:

### A. Uses HTTPS REST API (Bypasses Render's Port Block)

Unlike standard SMTP providers, Brevo offers an official Node.js SDK (`@getbrevo/brevo` v6) that sends email payloads over **HTTPS (Port 443)** using a REST API. Render never blocks Port 443, making email delivery reliable on free hosting tiers.

### B. No Custom Domain Required

Brevo allows sending transactional emails to **any real recipient email address** without owning a custom domain. You only need to verify a single personal email address (e.g., your personal `@gmail.com`) via a simple confirmation link in your inbox.

### C. Generous Free Volume

Brevo provides **300 free emails per day** (~9,000/month), which is more than sufficient for development, staging, and small-to-medium side projects.

### D. Native Support for Modern Node.js & Templating

Brevo's SDK v6 integrates smoothly with ES Module syntax (`import`) and HTML email generation tools like `mailgen`.

---

## 4. Comparison Summary

| Service                       | Bypasses Render Port Block? | Works Without Custom Domain? |    Sends to ANY Real Recipient?    | Free Limit  |
| :---------------------------- | :-------------------------: | :--------------------------: | :--------------------------------: | :---------: |
| **Gmail + Nodemailer (SMTP)** | ❌ No (Blocked on Port 587) |            ✅ Yes            |               ✅ Yes               |   500/day   |
| **Brevo (REST API)**          | ✅ **Yes (Uses Port 443)**  |          ✅ **Yes**          |             ✅ **Yes**             | **300/day** |
| **Resend / SendGrid**         |    ✅ Yes (via REST API)    |  ❌ No (Requires DNS Setup)  | ❌ No (Restricted to owner email)  |   Varies    |
| **Mailtrap (Testing)**        |           ✅ Yes            |            ✅ Yes            | ❌ No (Trapped in dummy dashboard) |  1,000/mo   |

---

## 5. Final Architecture Choice

- **Framework:** Node.js (ES Modules)
- **SDK:** `@getbrevo/brevo` (v6 REST API via HTTPS)
- **Template Generator:** `mailgen` (HTML & Plain Text)
- **Deployment Platform:** Render Free Tier
