<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Buyer and seller dashboards use a desktop side navigation and a full-screen mobile menu, while the account menu remains in the top bar so profile and sign-out stay consistently accessible.
- The home route renders approved marketplace listings through the existing SiteShell and LiveGrid; keep marketplace and dashboard routes server-renderable for speed and reliability.
- Home and buyer dashboard share MarketHome so search, category layout, and filters stay identical.
- Subcategory listing packages use public.subcategory_prices with admin-only writes and database-validated prices; listing fee, cadence, and expiry are snapshotted on products separately from item asking prices, and payment remains simulation-only.
- Store selected vehicle brands in products.brand; title matching is only a compatibility fallback for older listings without a brand.
