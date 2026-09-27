# Vroomever production authentication setup

The application now sends signup confirmation redirects to `/auth/confirm` and verifies Supabase's `token_hash` with `supabase.auth.verifyOtp({ type: "email", token_hash })`.

## Hosted Supabase

In Supabase Dashboard:

1. **Authentication → URL Configuration**
   - Site URL: `https://vroomever.com`
   - Add Redirect URL: `https://vroomever.com/auth/confirm`
   - If you use a staging domain, add its exact `/auth/confirm` URL too.

2. **Authentication → Email Templates → Confirm signup**
   - Subject: `Verify your Vroomever account`
   - Use the template in `supabase/templates/confirmation.html`.
   - The important link is:
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

3. **Authentication → SMTP**
   - For production, connect your SMTP provider.
   - From name: `Vroomever`
   - From address: use a verified address such as `no-reply@vroomever.com`.
   - Keep SMTP credentials only in Supabase; never commit them to GitHub.

The repository cannot change hosted Supabase SMTP credentials because those are project secrets. The code/template changes prevent the blank callback page; the dashboard SMTP/template settings control the sender identity and delivery.

## Database

Apply the migration:

`supabase/migrations/20260927210000_vroomever_auth_admin_hardening.sql`

It:
- makes seller signup create/repair `seller_profiles`;
- keeps admin accounts on the admin role;
- adds reports, audit logs, VIP promotions and platform settings;
- provides an admin-only audit logging function.

The existing Supabase Auth user remains the source of authentication. No admin password is stored in application tables.

## Seller flow

Signup metadata contains `role: "seller"` → Auth user → `profiles.role = seller` → `seller_profiles.user_id = auth.users.id` → seller dashboard.

Login no longer treats an unknown/missing profile as buyer. A missing or invalid role is an error.

## Important

The hosted Supabase project must have the migration applied and the Site URL/redirect URL configured before production verification links will work.
