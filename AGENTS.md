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
- The landing page owns the only WebGL scene and is client-rendered; keep marketplace and dashboard routes server-renderable for speed and reliability.
