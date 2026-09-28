-- VroomEver RBAC repair
-- Roles are buyer, seller, admin. Public signup can create buyer/seller only.
-- Admin is granted only by an existing admin or by the one-time manual bootstrap step.

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

-- Repair accounts that were created before the role trigger was working.
-- Never promote from public metadata to admin.
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

-- A legacy seller profile is allowed to repair its own buyer/seller role,
-- but it can never create or grant admin.
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
    select 1
    from public.seller_profiles
    where user_id = (select auth.uid())
  ) then
    return false;
  end if;

  update public.profiles
  set role = 'seller',
      updated_at = now()
  where id = (select auth.uid())
    and role <> 'admin';

  return found;
end;
$$;

revoke all on function public.sync_my_seller_role() from public;
grant execute on function public.sync_my_seller_role() to authenticated;

-- Keep admin role management server-side through the existing admin RPC.
create or replace function public.admin_set_user_role(target_user_id uuid, target_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  if target_role not in ('buyer','seller','admin') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = target_role,
      updated_at = now()
  where id = target_user_id;

  return found;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
