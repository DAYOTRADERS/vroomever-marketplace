-- FIRST ADMIN RECOVERY
-- Run this only after creating the administrator in Supabase Auth > Users.
-- This does not contain or change the user's password.

do $$
declare
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where lower(email) = lower('arnoldadmin@gmail.com')
  limit 1;

  if admin_id is null then
    raise exception 'Create arnoldadmin@gmail.com in Supabase Authentication > Users first.';
  end if;

  insert into public.profiles (id, full_name, role)
  values (admin_id, 'VroomEver Administrator', 'admin')
  on conflict (id) do update
    set role = 'admin',
        updated_at = now();
end $$;

-- Verify:
select u.id, u.email, p.full_name, p.role
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('arnoldadmin@gmail.com');
