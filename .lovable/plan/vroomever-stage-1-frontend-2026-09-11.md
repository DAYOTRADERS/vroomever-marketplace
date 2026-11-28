# Vroomever Stage 1 Frontend

## Goal
Build the complete, previewable Vroomever marketplace frontend before any backend work. All data, authentication, payments, and moderation actions will be realistic simulations backed by centralized mock data and browser state only.

## Experience
- Original Vroomever identity with a generated futuristic marketplace lettermark, matching favicon, loading treatment, and subtle watermarking.
- Premium glass surfaces, restrained glow, rich gradients, rounded cards, polished typography, light/dark themes, and responsive mobile/desktop navigation.
- Shared marketplace shell for buyers and sellers, a focused authentication experience, and a visually distinct enterprise admin control center.

## Build
1. **Foundation and brand**
   - Create semantic design tokens, typography, motion, theme handling, reusable navigation, buttons, cards, filters, status badges, tables, dialogs, and empty/loading states.
   - Generate and integrate the Vroomever logo and favicon.
   - Centralize categories, detailed subcategories, package prices/limits, VIP durations/prices, users, sellers, products, reports, payments, and analytics fixtures.

2. **Marketplace and authentication**
   - Build `/`, `/login`, `/signup`, `/dashboard`, `/category/$category`, `/product/$id`, `/seller/$id`, `/favorites`, and `/profile`.
   - Include search, filtering, favorites, verified/VIP states, seller contact and WhatsApp actions, galleries with up to five photos and one video, and buyer/seller role selection with required terms acceptance.

3. **Seller commerce flows**
   - Build `/sell` as the complete Category → Subcategory → Details → Media → Review → Subscription → Payment → Publish flow.
   - Enforce five-photo and one-video limits in the interface.
   - Build `/subscriptions`, `/subscriptions/payment`, `/vip`, `/seller/dashboard`, and `/seller/listings` with simulated loading, success, and failure states for M-Pesa and card payments.

4. **Administration**
   - Build separate `/masteradmin/login` and protected-looking `/masteradmin` control-center layouts.
   - Add users, products, categories/subcategories, subscriptions, VIP ads, reports, simulated payments, analytics, audit logs, and settings pages.
   - Include realistic moderation controls for approving, rejecting, hiding, deleting, suspending, and subscription management as frontend simulations.

5. **Legal, quality, and preview**
   - Build `/terms`, `/privacy`, `/seller-terms`, and `/buyer-terms`.
   - Give every page unique metadata and working navigation.
   - Verify all routes, responsive layouts, theme switching, forms, dialogs, media limits, simulated payment states, and admin actions in the live preview.

## Technical details
- TanStack Start routes with reusable React/TypeScript components.
- Centralized typed configuration and mock datasets; no database, external authentication, storage, or real payment API in Stage 1.
- Browser-local state may be used only for temporary frontend simulation and will be replaced during Stage 2.
- Stage 2 will begin only after Stage 1 is complete and previewable, then add backend-ready models/services and security architecture.
