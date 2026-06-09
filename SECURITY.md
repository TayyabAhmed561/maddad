# Security

## Reporting vulnerabilities

Email **security@maddad.ca** with details of the vulnerability.
We aim to respond within 48 hours.
Please do not publicly disclose until we have had a chance to address the issue.

## What we protect

- All financial data encrypted in transit (TLS 1.2+)
- Stripe handles all card data — Maddad never sees raw card numbers (PCI DSS compliant)
- Donor PII stored in Supabase (SOC 2 Type II compliant infrastructure)
- Stripe webhook signatures verified on every inbound event before any processing
- Row Level Security (RLS) enabled on every database table
- JWT app_metadata used for role-based access control — never trusts client-supplied roles
- Zakat and Sadaqah funds are never mixed in any query, transaction, or display

## Controls in place

| Control | Implementation |
|---|---|
| Webhook integrity | `stripe.webhooks.constructEvent` before any handler runs |
| Idempotent payments | Duplicate `payment_intent.succeeded` events are no-ops |
| Amount bounds | $1.00–$25,000.00 CAD enforced server-side |
| Campaign validation | Approval status, active flag, deleted_at checked before PI creation |
| Input sanitization | HTML stripped, length capped on all public form fields |
| Rate limiting | create-payment-intent: 10 req/min per IP |
| Security headers | X-Frame-Options, CSP, Referrer-Policy via Vercel |
| Secrets | All keys in Supabase Edge Function secrets or Vercel env — never in source |
| Audit log | Application status changes logged to `application_audit_log` |
| PIPEDA | Data deletion requests tracked; donors can request deletion from /my-giving |

## Responsible disclosure

We take security seriously. If you discover a vulnerability, please report it privately at security@maddad.ca before any public disclosure. We will work to address verified issues promptly.
