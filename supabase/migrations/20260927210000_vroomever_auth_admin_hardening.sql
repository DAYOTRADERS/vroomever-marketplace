-- Vroomever production auth/database hardening
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare chosen public.app_role;
begin
  chosen := case when new.raw_user_meta_data->>'role' = 'seller' then 'seller'::public.app_role else 'buyer'::public.app_role end;
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), chosen)
  on conflict (id) do update set full_name=excluded.full_name, role=case when public.profiles.role='admin' then 'admin' else excluded.role end, updated_at=now();
  if chosen='seller' then
    insert into public.seller_profiles(user_id,shop_name)
    values(new.id,coalesce(nullif(new.raw_user_meta_data->>'shop_name',''),nullif(new.raw_user_meta_data->>'full_name',''),'Vroomever Seller'))
    on conflict(user_id) do nothing;
  end if;
  return new;
end;
$$;

insert into public.seller_profiles(user_id,shop_name)
select p.id,coalesce(nullif(p.full_name,''),'Vroomever Seller') from public.profiles p where p.role='seller'
on conflict(user_id) do nothing;

create or replace function public.ensure_seller_profile()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.role='seller' then
  insert into public.seller_profiles(user_id,shop_name)
  values(new.id,coalesce(nullif(new.full_name,''),'Vroomever Seller'))
  on conflict(user_id) do nothing;
 end if;
 return new;
end;
$$;
drop trigger if exists ensure_seller_profile on public.profiles;
create trigger ensure_seller_profile after insert or update of role on public.profiles
for each row execute function public.ensure_seller_profile();

create table if not exists public.reports(
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid references auth.users(id) on delete set null,
 product_id uuid references public.products(id) on delete cascade,
 reason text not null,
 details text,
 status text not null default 'open' check(status in('open','investigating','resolved','dismissed')),
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);
alter table public.reports enable row level security;
grant select,insert,update on public.reports to authenticated;
drop policy if exists reports_admin_all on public.reports;
create policy reports_admin_all on public.reports for all to authenticated using(public.is_admin()) with check(public.is_admin());

create table if not exists public.audit_logs(
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references auth.users(id) on delete set null,
 action text not null,
 target_type text,
 target_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
grant select on public.audit_logs to authenticated;
drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_admin_read on public.audit_logs for select to authenticated using(public.is_admin());

create or replace function public.admin_log(p_action text,p_target_type text default null,p_target_id uuid default null,p_details jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
 if not public.is_admin() then raise exception 'Administrator access required'; end if;
 insert into public.audit_logs(actor_id,action,target_type,target_id,details)
 values(auth.uid(),p_action,p_target_type,p_target_id,coalesce(p_details,'{}'::jsonb))
 returning id into new_id;
 return new_id;
end;
$$;
revoke all on function public.admin_log(text,text,uuid,jsonb) from public;
grant execute on function public.admin_log(text,text,uuid,jsonb) to authenticated;

create table if not exists public.vip_promotions(
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 seller_id uuid not null references auth.users(id) on delete cascade,
 duration_days integer not null check(duration_days>0),
 amount_ksh integer not null default 0,
 status text not null default 'pending' check(status in('pending','active','expired','cancelled')),
 starts_at timestamptz not null default now(),
 expires_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.vip_promotions enable row level security;
grant select,insert,update on public.vip_promotions to authenticated;
drop policy if exists vip_owner_read on public.vip_promotions;
create policy vip_owner_read on public.vip_promotions for select to authenticated using(seller_id=auth.uid() or public.is_admin());
drop policy if exists vip_owner_insert on public.vip_promotions;
create policy vip_owner_insert on public.vip_promotions for insert to authenticated with check(seller_id=auth.uid());
drop policy if exists vip_admin_manage on public.vip_promotions;
create policy vip_admin_manage on public.vip_promotions for all to authenticated using(public.is_admin()) with check(public.is_admin());

create table if not exists public.platform_settings(
 key text primary key,
 value jsonb not null default '{}'::jsonb,
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;
grant select,insert,update on public.platform_settings to authenticated;
drop policy if exists settings_admin_all on public.platform_settings;
create policy settings_admin_all on public.platform_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
