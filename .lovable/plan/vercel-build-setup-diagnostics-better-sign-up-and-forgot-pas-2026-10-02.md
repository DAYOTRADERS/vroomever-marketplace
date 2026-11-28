# Vercel build, setup diagnostics, better sign-up and forgot password

## 1. Make the Vercel build use this app's database
- Now that Vercel has no database settings of its own, the site falls back to the settings saved with the app. Make sure those point to this app's database and not the old one.
- Run a full production build here, the same kind Vercel runs, and fix anything that breaks.
- Check that pages that need the server (AI descriptions, admin account creation) fail with a clear message instead of a crash when the server secret is missing. Admin creation already has a backup method that doesn't need the secret.

## 2. Protected setup diagnostics page: /masteradmin/diagnostics
- Only signed-in admins can open it. Everyone else is sent to /masteradmin/login. A link is added to the admin sidebar.
- It shows a pass, warning or fail card for each check:
  - **Database connection:** can it be reached, and which kind is in use (this app's database or a different one). It only shows a masked address, never keys.
  - **Required tables:** profiles, user_roles, categories, products, subscription_packages, subscriptions, payments, favorites, reports, audit_logs.
  - **Required account functions:** check my role, admin exists, list users, set role, become seller.
  - **Account roles:** whether an admin exists, the number of buyers, sellers and admins, and whether the signed-in account is really an admin.
  - **Server secret:** shows only "configured" or "not configured", never the value.
  - **Email sign-in:** whether sign-up is on and whether a confirmation email is required.
- A "Run checks again" button, plus a short fix tip next to each failed check.

## 3. Buyer and seller sign-up improvements
- After sign-up, a clear status box shows: "Confirmation email sent to name@email as BUYER (or SELLER)", what to do next, and which login form to use.
- A **Resend confirmation email** button with a 60-second wait between sends, which shows success or the reason it failed (for example, too many requests).
- Time-out handling: if sign-up takes longer than 20 seconds, the form stops waiting and explains that the account may still have been created. It then offers "Resend confirmation email", "Try signing in" and "Use a different email".
- On sign-in, if the email isn't confirmed yet, the form says so and shows the resend button.

## 4. Forgot password (Buyer and Seller login only)
- A **Forgot password?** link on the Buyer and Seller login tabs only. The admin login doesn't get one.
- The user enters their email and gets a reset link by email. The same message is shown whether or not the email exists, so no one can check which emails have accounts.
- A new public page, **/reset-password**, opens from the email link and lets the user set and confirm a new password. Afterwards, the user is sent to the correct Buyer or Seller login.
- Admin accounts that try this are told to contact an administrator.

## Technical details
- Diagnostics: a new route under the masteradmin area. It is a browser-side admin check using `getMyRoleRow`, plus a server function protected by `requireSupabaseAuth` that checks for the admin role, then reports table and function presence via lightweight queries. The secret check reports only a boolean. Admin-only access is enforced again on the server.
- Sign-up: uses `supabase.auth.resend({ type: "signup" })`, `Promise.race` with a 20s timeout, and detects the "Email not confirmed" error on sign-in.
- Forgot password: `resetPasswordForEmail(email, { redirectTo: origin + "/reset-password" })`. The `/reset-password` route uses `updateUser({ password })` once the recovery session arrives.
- Build: verify with a production `vite build` and confirm that the committed project settings provide the browser database values when no host variables are set.
- No database changes are needed.
