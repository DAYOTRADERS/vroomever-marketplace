# Vroomever Marketplace

Build Vroomever.com in two stages. STAGE 1 FIRST: complete and preview the entire frontend before implementing backend functionality.

STAGE 1 — FRONTEND

Create a polished futuristic Kenyan marketplace inspired by the functionality of Jiji/Jumia but with a completely original design and branding.

Build all frontend pages and routing:

/ landing/marketing page

/login

/signup

/dashboard

/category/:category

/product/:id

/seller/:id

/favorites

/profile

/sell

/subscriptions

/subscriptions/payment

/vip

/seller/dashboard

/seller/listings

/masteradmin/login

/masteradmin

/masteradmin/users

/masteradmin/products

/masteradmin/categories

/masteradmin/subscriptions

/masteradmin/vip

/masteradmin/reports

/masteradmin/payments

/masteradmin/analytics

/masteradmin/audit

/masteradmin/settings

/terms

/privacy

/seller-terms

/buyer-terms

BRAND/UI

Create an original Vroomever logo and favicon using a futuristic marketplace symbol/lettermark. Generate the logo asset and use it consistently in the navbar, login/signup, dashboard, admin panel, browser favicon and loading screen. Do not copy Jiji/Jumia branding.

Use premium glassmorphism, futuristic gradients, subtle glow, shadows, rounded cards, animated backgrounds, realistic category icons, smooth hover effects, light/dark themes, responsive mobile/desktop layouts, professional typography and subtle Vroomever watermarks.

Brand:
VROOMEVER
Discover • Connect • Trade

AUTH + ROLES

Signup must allow:

Buyer

Seller

Require Terms & Conditions acceptance.

Buyer can browse/search/filter/favorite/contact sellers.

Seller has all buyer abilities plus:

Post products

Manage listings

Subscription

VIP promotion

WhatsApp contact

Keep buyer and seller data/roles logically separated and backend-ready.

CATEGORIES

Create all 16:
Cars, Fashion, Food Stuff, Gem Stones, Furniture, Property, Leisure, Phones & Tablets, Beauty & Personal Care, Repair & Construction, Commercial Equipment, Babies & Kids, Animals & Pets, Jobs, Business & Industry, Services.

Each category gets realistic unique icons and dedicated subcategories/filters. For vehicles include cars, parts, motorcycles, buses, trucks, heavy machinery, boats, personal mobility and car services. Create equivalent detailed subcategories for other categories.

PRODUCTS

Product cards/details must show:

up to 5 photos

maximum 1 video

title

description

KSh price

location

condition

seller

verification

favorites

WhatsApp/contact

VIP badge

Enforce the 5-photo/1-video limits in the frontend.

SELLER FLOW

Seller → Post Product → Category → Subcategory → Details → Media → Review → Subscription → Payment → Publish.

Packages:

Bronze — monthly

Silver — monthly

Gold — yearly

Use configurable KSh placeholder prices and listing limits.

VIP promotion must have configurable durations/prices and appear in featured/main dashboard sections.

PAYMENTS

Create beautiful M-Pesa STK Push and Card payment interfaces, but DO NOT integrate real payments yet. Use simulated success/failure/loading states only. Never expose payment secrets in frontend code.

ADMIN

/masteradmin is a separate protected futuristic enterprise control center.

Admin can manage:
users, buyers, sellers, products, categories, subcategories, subscriptions, VIP ads, reports, simulated payments, analytics and audit logs.

Admin can approve/reject/hide/delete listings, suspend users, manage subscriptions and moderate every seller post.

STAGE 2 — BACKEND PREPARATION

After STAGE 1 is complete and previewable, prepare the application for Supabase with clean TypeScript models/services for:

users, buyers, sellers, products, categories, product_images, product_videos, subscriptions, subscription_packages, vip_advertisements, favorites, reports, payments, notifications, admin_users, audit_logs.

Prepare authentication, role-based permissions, storage and Row Level Security architecture, but do not add real payment integrations yet.

IMPORTANT

Do not build only a landing page. Complete the actual marketplace UI, buyer dashboard, seller dashboard, product system, subscription flow, VIP system and /masteradmin.

Use reusable React/TypeScript components and centralized configuration for categories, packages, limits and prices. Avoid duplicate code and unnecessary dependencies to conserve Lovable credits.

Finish STAGE 1 completely and make it previewable before proceeding to STAGE 2.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/38d9aa0c-ab61-4d2d-9efd-237050cb45c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
