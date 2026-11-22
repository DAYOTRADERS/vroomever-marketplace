# VRUMEX backend migration plan (inspection only, nothing changed)

Goal: move the marketplace from the current Lovable Cloud backend to the separate project `hooxnftxqfwhxnapobfx`, keeping every user, listing and photo, with the live site untouched until a final, confirmed switch.

## 1. What the app depends on today (verified)

Database (public schema), 15 tables:
audit_logs, categories, favorites, payments, product_enquiries, products, profiles, reports, staff_activity, subcategory_prices, subscription_packages (legacy), subscriptions (legacy), support_messages, support_replies, user_roles.
- Enums: app_role (admin, seller, buyer, customer_care, secretary), product_status (pending, active, hidden, rejected).
- Links to accounts: favorites, payments, products, profiles, reports, subscriptions, support_messages, support_replies, user_roles all reference auth user IDs, so accounts must move first with identical IDs.
- 23 functions (roles, admin tools, pricing, moderation, logging) and 27 triggers, including `on_auth_user_created` on the account table (creates profile + role on signup).
- Row-level security on every table; policy text is read from the source at migration time.
- Schema history: 15 files in supabase/migrations, 7 in drizzle/migrations, plus supabase/schema.sql and supabase/storage.sql snapshots.

Storage: one private bucket `product-media` (listing photos/videos, ID documents, avatars) with owner/admin/staff access rules.

Accounts: email + password sign-in, Google, password-reset redirect to vrumex.com/reset page. Users' password hashes live in the account table.

Server code using privileged access: staff-accounts, admin-accounts, admin-setup, media (signed links), support, diagnostics, categories server functions. One leftover edge function `admin-create-user`.

Secrets/config: app reads VITE_SUPABASE_URL / _PUBLISHABLE_KEY / _PROJECT_ID in the browser and SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY on the server. LOVABLE_API_KEY powers support AI summaries.

## 2. Important limits (stated up front)

- This project's Lovable Cloud connection cannot be swapped to another backend in place. The realistic path is a **new Lovable project (remix/copy of this code) connected to the destination**, or a self-hosted deployment. The current site stays live on Cloud throughout.
- I cannot see the destination schema yet: no credentials for it exist here. The comparison step is therefore pending.
- The Cloud service-role key and database password are not available to anyone, so I cannot pull the source server-to-server. The source copy comes from Lovable's built-in export.

## 3. Credentials / approvals needed (no secrets in chat)

Source (you do this in the product):
- More -> Database -> Manage -> Settings -> Export project data -> Database -> Export. Includes full schema, data and user accounts **with password hashes**, so users keep their passwords and no reset emails are needed.
- More -> Storage: download all `product-media` files (export does not include them).

Destination (in the new project that will use it):
- Connect the destination Supabase project through that project's Supabase connection (Lovable's secure flow), or add these in Project Settings -> Secrets: `DEST_SUPABASE_URL`, `DEST_SUPABASE_SERVICE_ROLE_KEY`, `DEST_DB_URL`.
- In the destination's own dashboard: Google sign-in client ID/secret, site URL + redirect URLs (vrumex.com, www, preview), email sender settings.
- Facebook login (your original reason) is configured there too, only after migration is verified.

## 4. Migration steps

1. Backup: take the Cloud database export + storage download; note the latest daily backup time in More -> Database -> Manage -> Backups. Freeze: announce a short maintenance window and pause new posts (optional read-only banner, approved separately).
2. Inspect destination: list its existing tables/users/buckets. If not empty, stop and agree on a merge or wipe before continuing.
3. Restore the export into the destination (accounts + public schema + data in one restore, preserving user IDs, password hashes, enums, functions, triggers, RLS, grants).
4. Recreate bucket `product-media` (private) and its access rules from supabase/storage.sql; upload files keeping identical paths so listing `images`/`video_url` values still resolve.
5. Verify counts per table and per bucket match the source; spot-check RLS (signed-out sees only approved listings; seller sees own; admin/staff desks work).
6. Point the new project's app config at the destination; re-add LOVABLE_API_KEY equivalent if AI summaries are kept; drop the unused `admin-create-user` function.
7. Test on the new project's preview: existing user sign-in with old password, Google sign-in, post -> approve -> appears, photo/video gallery, favorites, support replies, staff logs, password reset page (no emails sent without your go-ahead).
8. Cutover (separate approval): delta re-export of anything created during the window, move domains vrumex.com/www to the new project, publish.

## 5. Rollback

- Until step 8 the live site is never touched; rollback = do nothing.
- After cutover: move the domains back to this project (Cloud data unchanged since freeze). Data created on the destination after cutover would need a manual copy back, so keep a short watch period before deleting anything.
- Keep the Cloud backend and export files for at least 30 days.

## 6. Data mapping

All tables map 1:1, same names, columns and IDs. Exceptions to decide:
- subscription_packages / subscriptions: legacy, unused — copy as-is (recommended) or drop.
- payments: simulated only; copy unchanged.
- Storage paths unchanged; signed links regenerate automatically.

## Next step after approval

Nothing is run until you complete the export/storage download and connect the destination securely; then I inspect the destination and report the comparison before any write.
