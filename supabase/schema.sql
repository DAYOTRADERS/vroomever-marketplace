create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role text not null default 'buyer' check (role in ('buyer','seller','admin')),
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
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null default '',
  price numeric(14,2) not null check (price >= 0),
  location text,
  condition text,
  status text not null default 'draft'
    check (status in ('draft','pending','active','hidden','sold','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_seller_idx on public.products(seller_id);
create index if not exists products_category_status_idx on public.products(category_id,status);
create index if not exists products_created_idx on public.products(created_at desc);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists product_media_product_idx on public.product_media(product_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  -- Public signup may choose buyer or seller. Admin is never accepted from
  -- browser-controlled metadata; admin access is granted separately.
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' = 'seller' then 'seller'
      else 'buyer'
    end
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        updated_at = now();
  return new;
end;
$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  if (select auth.uid()) = old.id and new.role is distinct from old.role then
    -- A legacy seller account may repair buyer -> seller when it already has
    -- a seller_profiles record. Admin can never be granted by the client.
    if new.role = 'seller'
       and exists (
         select 1
         from public.seller_profiles
         where user_id = old.id
       ) then
      return new;
    end if;
    raise exception 'Role changes are not allowed from the client';
  end if;
  return new;
end;
$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update on public.profiles
for each row execute procedure public.prevent_self_role_change();

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.seller_profiles from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.product_media from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.categories to anon, authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select on table public.products to anon;
grant select, insert, update, delete on table public.product_media to authenticated;
grant select on table public.product_media to anon;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select
to authenticated using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select
to anon, authenticated using (true);

drop policy if exists products_public_active_read on public.products;
create policy products_public_active_read on public.products for select
to anon, authenticated using (status = 'active' or seller_id = (select auth.uid()));

drop policy if exists products_owner_insert on public.products;
create policy products_owner_insert on public.products for insert
to authenticated with check (seller_id = (select auth.uid()));

drop policy if exists products_owner_update on public.products;
create policy products_owner_update on public.products for update
to authenticated using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

drop policy if exists products_owner_delete on public.products;
create policy products_owner_delete on public.products for delete
to authenticated using (seller_id = (select auth.uid()));

drop policy if exists media_public_active_read on public.product_media;
create policy media_public_active_read on public.product_media for select
to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id
      and (p.status = 'active' or p.seller_id = (select auth.uid()))
  )
);

drop policy if exists media_owner_insert on public.product_media;
create policy media_owner_insert on public.product_media for insert
to authenticated
with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.seller_id = (select auth.uid())
  )
);

drop policy if exists media_owner_update on public.product_media;
create policy media_owner_update on public.product_media for update
to authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.seller_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.seller_id = (select auth.uid())
  )
);

drop policy if exists media_owner_delete on public.product_media;
create policy media_owner_delete on public.product_media for delete
to authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.seller_id = (select auth.uid())
  )
);


-- Secure admin read access. Admin passwords belong to Supabase Auth;
-- never store admin passwords in this public application database.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('buyer','seller','admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles for select
to authenticated using (public.is_admin());

drop policy if exists products_select_admin on public.products;
create policy products_select_admin on public.products for select
to authenticated using (public.is_admin());

drop policy if exists product_media_select_admin on public.product_media;
create policy product_media_select_admin on public.product_media for select
to authenticated using (public.is_admin());


create or replace function public.admin_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email, coalesce(p.full_name, ''), coalesce(p.role, 'buyer'), u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_admin();
$$;

revoke all on function public.admin_users() from public;
grant execute on function public.admin_users() to authenticated;


-- Marketplace taxonomy: exactly 21 top-level categories used by the application.
insert into public.categories (name, slug)
values
  ('Cars & Vehicles','cars'),
  ('Property','property'),
  ('Phones & Tablets','phones-tablets'),
  ('Electronics','electronics'),
  ('Fashion','fashion'),
  ('Furniture','furniture'),
  ('Home Appliances','home-appliances'),
  ('Food Stuff','food-stuff'),
  ('Agriculture & Farming','agriculture'),
  ('Gemstones & Jewellery','gem-stones'),
  ('Beauty & Personal Care','beauty'),
  ('Repair & Construction','repair-construction'),
  ('Commercial Equipment','commercial-equipment'),
  ('Business & Industry','business-industry'),
  ('Babies & Kids','babies-kids'),
  ('Animals & Pets','animals-pets'),
  ('Leisure & Sports','leisure-sports'),
  ('Jobs','jobs'),
  ('Services','services'),
  ('Health & Medical','health-medical'),
  ('Office & School','office-school')
on conflict (slug) do update set name = excluded.name;

-- Administrators can manage the marketplace taxonomy and listings; buyers/sellers
-- remain restricted by the owner policies above.
grant select, insert, update, delete on table public.categories to authenticated;

drop policy if exists categories_admin_manage on public.categories;
create policy categories_admin_manage on public.categories for all
to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_admin_manage on public.products;
create policy products_admin_manage on public.products for all
to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_media_admin_manage on public.product_media;
create policy product_media_admin_manage on public.product_media for all
to authenticated using (public.is_admin()) with check (public.is_admin());


-- Admin-only role management. Seller/buyer roles are controlled from the
-- authenticated profile record; administrators can correct an account when
-- a legacy profile was created with the wrong role.
create or replace function public.admin_set_user_role(target_user_id uuid, target_role text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;
  if target_role not in ('buyer','seller','admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles
  set role = target_role, updated_at = now()
  where id = target_user_id;
  return found;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
