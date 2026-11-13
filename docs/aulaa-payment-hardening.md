# Aulaa payment hardening

This branch implements the approved guest-checkout payment hardening. It does not apply migrations, change hosted Supabase secrets, edit the Aulaa dashboard, merge, or deploy.

## Architecture

- Guest checkout remains unauthenticated; no customer Auth account is introduced.
- Supabase Edge Functions use the server-side service role key. It must never be exposed through a `VITE_` variable or sent to the browser.
- The backend calculates package pricing from `public.travel_package_pricing`; client-submitted totals are ignored.
- Guest access tokens are 256-bit random base64url values. Only SHA-256 hashes are stored in `public.bookings.access_token_hash`.
- The raw token is returned once to the checkout result screen and is required for lookup, status, cancellation, invoice recovery, and review operations.
- `supabase/functions/aulaa-webhook` is the canonical webhook processor. `api/aulaa-webhook.ts` is a compatibility relay only.
- Booking/transaction changes from provider notifications and status reconciliation are applied through PostgreSQL RPC transactions.

## Supabase secrets

Configure these in the target Supabase project's Edge Function Secrets before deploying:

- `AULAA_API_KEY`
- `AULAA_WEBHOOK_SECRET`
- `APP_BASE_URL` (the trusted HTTPS origin of the ASRIVA application; used to construct redirect URLs server-side)

The application origin must be an HTTPS URL. The backend ignores client-supplied redirect destinations and constructs the Aulaa redirect from this configured origin. Provider payment links are accepted only when their host is `payment.aulaa.co`.

The hosted Edge Function runtime supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Do not place the service-role key in Vercel or browser environment variables.

## Aulaa callback URL

Set the Aulaa API project's callback URL to:

```text
https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/aulaa-webhook
```

The project reference must be confirmed from the actual Supabase project. Do not infer it from the GitHub repository name.

If the merchant dashboard temporarily still points to the Vercel compatibility route, configure Vercel with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; the route forwards the raw request body and signature to the canonical Edge Function.

## Migration and deployment order

1. Confirm the target Supabase project and current schema backup.
2. Review and apply `supabase/migrations/002_aulaa_payment_hardening.sql`.
3. Configure the two Aulaa secrets.
4. Deploy the Edge Functions, including the new `aulaa-retry-payment`.
5. Verify the Supabase function configuration disables platform JWT verification only for `aulaa-webhook`; the function itself verifies the Aulaa signature.
6. Change the Aulaa callback URL to the canonical Supabase URL.
7. Run the sandbox test matrix before production.

## Required sandbox checks

- Invalid/missing webhook signature returns 401.
- Valid payment webhook changes transaction and booking in one atomic operation.
- Duplicate webhook body is acknowledged without applying changes twice.
- Amount, order ID, transaction ID, currency, or country mismatch is rejected.
- Stale terminal events cannot downgrade a paid/refunded transaction.
- Guest token is required for lookup, cancellation, status, invoice recovery, and review.
- Client-modified prices do not affect the server-calculated booking amount.
- Aulaa 409 and ambiguous create timeout recover using the same stable `order_id`.
- A database persistence error is not acknowledged as successful processing.
- Refund status is stored and displayed distinctly.

## Verification status

The changes are committed to `feature/aulaa-payment-hardening`. No hosted migration or deployment has been run. Build/lint and live sandbox tests remain pending because this execution environment could not clone the repository or reach GitHub from the shell. The repository's prior implementation and the hardened handler use `X-Webhook-Signature` with a hex HMAC-SHA256 digest over the exact raw request body. Confirm this exact header/encoding with a current official Aulaa sandbox sample before enabling the callback in production.
