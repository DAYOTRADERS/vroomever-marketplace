-- VROOMEVER ROLE + FIRST ADMIN RECOVERY
-- Run this in Supabase SQL Editor.
-- It never stores a password and never grants admin from browser metadata.
-- BEFORE the final block, create the first admin Auth user in:
-- Supabase Dashboard -> Authentication -> Users -> Add user.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('buyer','seller','admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) = old.id and new.role is distinct from old.role then
    if new.role = 'seller'
       and exists (
         select 1 from public.seller_profiles
         where user_id = old.id
       ) then
      return new;
    end if;
    raise exception 'Role changes are not allowed from the client';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update on public.profiles
for each row execute procedure public.prevent_self_role_change();

-- Repair every existing Auth user that is missing a profile.
-- Existing admin roles are preserved. Browser metadata can only produce buyer/seller.
insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  case
    when u.raw_user_meta_data ->> 'role' = 'seller' then 'seller'
    else 'buyer'
  end
from auth.users u
on conflict (id) do update
set
  full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
  role = case
    when public.profiles.role = 'admin' then 'admin'
    when excluded.role = 'seller' then 'seller'
    else public.profiles.role
  end,
  updated_at = now();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
for select to authenticated using ((select public.is_admin()));

drop policy if exists products_select_admin on public.products;
create policy products_select_admin on public.products
for select to authenticated using ((select public.is_admin()));

drop policy if exists product_media_select_admin on public.product_media;
create policy product_media_select_admin on public.product_media
for select to authenticated using ((select public.is_admin()));

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
set search_path = ''
as $$
  select
    u.id,
    u.email,
    coalesce(p.full_name, ''),
    coalesce(p.role, 'buyer'),
    u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where (select public.is_admin());
$$;

revoke all on function public.admin_users() from public;
grant execute on function public.admin_users() to authenticated;

create or replace function public.sync_my_seller_role()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.seller_profiles
    where user_id = (select auth.uid())
  ) then
    return false;
  end if;

  update public.profiles
  set role = 'seller', updated_at = now()
  where id = (select auth.uid()) and role <> 'admin';

  return found;
end;
$$;

revoke all on function public.sync_my_seller_role() from public;
grant execute on function public.sync_my_seller_role() to authenticated;

create or replace function public.admin_set_user_role(target_user_id uuid, target_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
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

-- FIRST ADMIN:
-- Create arnoldadmin@gmail.com in Authentication -> Users first.
do $$
declare
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where lower(email) = lower('arnoldadmin@gmail.com')
  limit 1;

  if admin_id is null then
    raise exception 'Create arnoldadmin@gmail.com in Supabase Authentication -> Users first, then run this SQL again.';
  end if;

  insert into public.profiles (id, full_name, role)
  values (admin_id, 'VroomEver Administrator', 'admin')
  on conflict (id) do update
    set role = 'admin',
        updated_at = now();
end $$;

select u.id, u.email, p.full_name, p.role
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('arnoldadmin@gmail.com');
