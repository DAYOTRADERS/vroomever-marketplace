-- Keep profiles as the canonical authentication role and maintain separate
-- buyer, seller and admin records for clean role separation.
create table if not exists public.buyer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.seller_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.buyer_profiles enable row level security;
alter table public.seller_accounts enable row level security;
alter table public.admin_profiles enable row level security;

revoke all on table public.buyer_profiles from anon, authenticated;
revoke all on table public.seller_accounts from anon, authenticated;
revoke all on table public.admin_profiles from anon, authenticated;

grant select on public.buyer_profiles to authenticated;
grant select on public.seller_accounts to authenticated;
grant select on public.admin_profiles to authenticated;

drop policy if exists buyer_profiles_own on public.buyer_profiles;
create policy buyer_profiles_own on public.buyer_profiles
for select to authenticated using (user_id = auth.uid());

drop policy if exists seller_accounts_own on public.seller_accounts;
create policy seller_accounts_own on public.seller_accounts
for select to authenticated using (user_id = auth.uid());

drop policy if exists admin_profiles_own on public.admin_profiles;
create policy admin_profiles_own on public.admin_profiles
for select to authenticated using (user_id = auth.uid());

create or replace function public.sync_account_role_tables()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'buyer' then
    insert into public.buyer_profiles(user_id) values(new.id) on conflict do nothing;
    delete from public.seller_accounts where user_id = new.id;
    delete from public.admin_profiles where user_id = new.id;
  elsif new.role = 'seller' then
    insert into public.seller_accounts(user_id) values(new.id) on conflict do nothing;
    insert into public.seller_profiles(user_id) values(new.id) on conflict (user_id) do nothing;
    delete from public.buyer_profiles where user_id = new.id;
    delete from public.admin_profiles where user_id = new.id;
  elsif new.role = 'admin' then
    insert into public.admin_profiles(user_id) values(new.id) on conflict do nothing;
    delete from public.buyer_profiles where user_id = new.id;
    delete from public.seller_accounts where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_account_role_tables_trigger on public.profiles;
create trigger sync_account_role_tables_trigger
after insert or update of role on public.profiles
for each row execute procedure public.sync_account_role_tables();

insert into public.buyer_profiles(user_id)
select id from public.profiles where role = 'buyer'
on conflict do nothing;

insert into public.seller_accounts(user_id)
select id from public.profiles where role = 'seller'
on conflict do nothing;

insert into public.admin_profiles(user_id)
select id from public.profiles where role = 'admin'
on conflict do nothing;
revoke all on function public.sync_account_role_tables() from public;
