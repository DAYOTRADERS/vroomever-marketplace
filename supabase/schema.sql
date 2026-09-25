create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role text not null default 'buyer' check (role in ('buyer','seller')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  shop_name text,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, parent_id uuid references public.categories(id) on delete set null
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id) on delete cascade, category_id uuid references public.categories(id) on delete set null,
  title text not null, description text not null default '', price numeric(14,2) not null check (price >= 0), location text, condition text, status text not null default 'draft' check (status in ('draft','pending','active','hidden','sold','rejected')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists products_seller_idx on public.products(seller_id);
create index if not exists products_category_status_idx on public.products(category_id,status);
create index if not exists products_created_idx on public.products(created_at desc);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, media_type text not null check (media_type in ('image','video')), storage_path text not null, created_at timestamptz not null default now()
);
create index if not exists product_media_product_idx on public.product_media(product_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role) values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'role','buyer')) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists products_public_active_read on public.products;
create policy products_public_active_read on public.products for select using (status = 'active' or seller_id = auth.uid());
drop policy if exists products_owner_insert on public.products;
create policy products_owner_insert on public.products for insert with check (seller_id = auth.uid());
drop policy if exists products_owner_update on public.products;
create policy products_owner_update on public.products for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());
drop policy if exists products_owner_delete on public.products;
create policy products_owner_delete on public.products for delete using (seller_id = auth.uid());
drop policy if exists media_public_active_read on public.product_media;
create policy media_public_active_read on public.product_media for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));
drop policy if exists media_owner_insert on public.product_media;
create policy media_owner_insert on public.product_media for insert with check (exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()));
drop policy if exists media_owner_delete on public.product_media;
create policy media_owner_delete on public.product_media for delete using (exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()));
