-- Repair the first-admin bootstrap independently of any previous migration state.
-- Safe to run whether the RBAC migration was already applied or not.

create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.bootstrap_first_admin(
  target_full_name text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $v$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('vroomever:first-admin', 0));

  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'An administrator already exists';
  end if;

  update public.profiles
  set role = 'admin',
      full_name = coalesce(nullif(trim(target_full_name), ''), full_name),
      updated_at = now()
  where id = uid;

  if not found then
    insert into public.profiles (id, full_name, role)
    values (uid, coalesce(nullif(trim(target_full_name), ''), ''), 'admin');
  end if;

  return true;
end;
$v$;

revoke all on function public.bootstrap_first_admin(text) from public;
grant execute on function public.bootstrap_first_admin(text) to authenticated;
