-- Keep seller profiles consistent with seller roles.
create or replace function public.ensure_seller_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'seller' then
    insert into public.seller_profiles (user_id, shop_name)
    values (new.id, coalesce(nullif(new.full_name, ''), 'Vroomever Seller'))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_seller_profile on public.profiles;
create trigger ensure_seller_profile
after insert or update of role on public.profiles
for each row execute procedure public.ensure_seller_profile();

insert into public.seller_profiles (user_id, shop_name)
select id, coalesce(nullif(full_name, ''), 'Vroomever Seller')
from public.profiles
where role = 'seller'
on conflict (user_id) do nothing;
