# Fresh-start move of VRUMEX to the new database (hooxnftxqfwhxnapobfx)

## Key decision: use a separate copy, not this project
This project's live site (vrumex.com) stays on its current Lovable Cloud backend. Cloud cannot be switched off or pointed elsewhere in place, and the platform regenerates the connection settings, so changing settings here would either be overwritten or break the live site. **A remix (copy) of this project is required.** The copy is connected to the new database, tested on its own preview, and the domain is only moved after you approve.

## What the app depends on today (from the code)
- **Tables:** profiles, user_roles (roles: admin, seller, buyer, customer_care, secretary), categories (slug, subcategories array, position), subcategory_prices (weekly/monthly/annual), products (category_slug, subcategory, brand, status enum, listing_cadence/fee/expiry/payment_method, rejection_reason, VIP fields, views), favorites, product_enquiries, reports, payments (simulated), support_messages (+AI fields), support_replies, staff_activity, audit_logs. subscription_packages/subscriptions are legacy and will be dropped in the new database.
- **Database functions/triggers (22):** has_role, get_my_role, admin_exists, bootstrap_first_admin, become_seller, admin_users, admin_set_user_role, admin_delete_user, get_public_profile, record_product_view, handle_new_user (on new sign-up), guard_product_status, secretary_moderation_only, enforce_media_limits (max 5 photos), set_listing_package, record_listing_simulation, sync_subcategory_prices, support_reply_touch, log_staff_activity, audit_admin_changes, log_admin_action, staff_role_of.
- **Storage:** private bucket `product-media`; signed links (10 minutes); public only for approved, unexpired listings.
- **Server functions:** media, support (AI summary), describe (AI listing text), categories, admin-accounts, staff-accounts (create staff logins, password resets), diagnostics. No edge functions.
- **Sign-in:** email/password, password reset to /reset-password, Google and Apple through Lovable's sign-in helper, Facebook code path.

## Existing tables in the new database
The new project's tables (seller_profiles, buyer_profiles, admin_profiles, seller_accounts, product_media, a different products/categories) do not match what the app uses. Since everything is test data, the plan **drops those app tables** (after a schema-only dump for reference) and recreates the app's own schema. Rewriting the whole app around the new tables is not recommended: high risk, no benefit.

## Steps
1. **Remix** this project into "VRUMEX (new backend)". Live site untouched.
2. **Connect** the copy to hooxnftxqfwhxnapobfx through Lovable's Supabase connection screen (you approve it there; no keys in chat). If the copy comes with Cloud already attached, the connection must be made before Cloud is enabled on it — confirm this at remix time.
3. **Backup destination:** schema-only dump of its current tables; keep it for rollback.
4. **Schema:** one consolidated migration built from `supabase/migrations` + `drizzle/migrations`, in order: enums, tables with GRANTs, RLS on and policies, functions, triggers (incl. sign-up trigger on auth.users), then seed only reference data: 21 categories with subcategories (incl. Green Energy, "Construction & Repair") and price rows (weekly 50 / monthly 150 / yearly 1,500). No users, listings or sample items.
5. **Storage:** create private `product-media` bucket (size/type limits for images and video) with policies: owner upload/delete in own folder, owner/admin/staff read, public read via server signing only for approved listings.
6. **Secrets in the copy:** project URL, publishable key, secret key entered via the secure Secrets form / connection screen. AI features need a Lovable AI key in the copy (or are switched off).
7. **Sign-in setup on the new project:** Site URL and allowed redirects for the copy's preview, vrumex.com, www.vrumex.com, vrumever.app: `/auth`, `/reset-password`. Email sign-in on; email confirmation as you choose. Google/Apple/Facebook need your own app credentials in the new project (Lovable's managed Google helper only works with Cloud), so social buttons are switched to direct provider sign-in. Facebook becomes possible here.
8. **Email:** reset/confirm emails come from the new project's sender; set custom SMTP or templates there (notify.vrumex.com setup belongs to the Cloud project and doesn't carry over).
9. **First admin:** register through `/notevereveresit` on the copy; the database grants admin only when no admin exists. Then create staff logins from the admin desk.
10. **Tests:** run existing tests (marketplace options, conditions, pricing); add database checks: new sign-up gets profile + role, only one first admin, sellers cannot self-approve, secretary can only change status, more than 5 photos rejected, price limits enforced, unapproved media not public. Browser walk-through: sign up buyer/seller, post, admin approve, filter, favorite, contact needs login, support message, reset password.
11. **Cutover (only after your approval):** publish the copy, move vrumex.com domains to it, verify.

## Rollback
- Before cutover: delete or ignore the copy; the live site never changed.
- After cutover: move the domains back to this project (still on Cloud, untouched).
- Database: restore from the step-3 dump or drop and re-run the migration.

## What I need from you, when we build
- Approve the remix and the database connection in Lovable's screens.
- Enter keys only via the secure Secrets form.
- Provider credentials for Google/Apple/Facebook if you want them on day one.
- Confirm dropping the destination's existing empty app tables.
