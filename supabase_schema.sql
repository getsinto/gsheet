-- supabase_schema.sql
-- Complete schema for Strong Containers Delivery System

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto; -- for gen_random_uuid if needed

-- SCHEMA: public (default in Supabase)

-- USERS
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone text,
  role text check (role in ('admin','driver','dispatcher')) default 'driver',
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDERS
create sequence if not exists public.order_number_seq start 1 increment 1;

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  date date not null,
  delivery_window text check (delivery_window in ('AM','PM')) not null,
  driver_id uuid references public.users(id),
  driver_name text not null,
  market text not null,
  week_number integer check (week_number in (1,2)) not null,
  pickup_street text not null,
  pickup_city text not null,
  pickup_state text not null,
  pickup_zip text not null,
  container_type text not null,
  container_condition text,
  door_position text check (door_position in ('forward to cab','away from cab')),
  release_number text,
  customer_name text not null,
  customer_street text not null,
  customer_city text not null,
  customer_state text not null,
  customer_zip text not null,
  customer_phone text not null,
  driver_pay numeric(10,2) not null,
  miles integer not null,
  notes text,
  status text check (status in ('dispatched','loaded','notified','delayed','cancelled','delivered')) default 'dispatched',
  status_reason text,
  is_dispatched boolean default false,
  is_loaded boolean default false,
  is_notified boolean default false,
  is_delayed boolean default false,
  is_cancelled boolean default false,
  is_delivered boolean default false,
  is_locked boolean default false,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER PHOTOS
create table if not exists public.order_photos (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  photo_url text not null,
  public_id text not null,
  uploaded_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- ORDER COMMENTS
create table if not exists public.order_comments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references public.users(id),
  user_name text not null,
  comment text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ACTIVITY LOG
create table if not exists public.order_activity_log (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references public.users(id),
  user_name text not null,
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- APP SETTINGS
create table if not exists public.app_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  updated_by uuid references public.users(id),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text check (type in ('order_assigned','status_changed','order_created','order_delayed')),
  is_read boolean default false,
  order_id uuid references public.orders(id) on delete cascade,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_orders_driver_id on public.orders(driver_id);
create index if not exists idx_orders_date on public.orders(date);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_week_number on public.orders(week_number);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_order_photos_order_id on public.order_photos(order_id);
create index if not exists idx_order_comments_order_id on public.order_comments(order_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

-- FUNCTIONS
-- helper: is_admin(uid) - SECURITY DEFINER to avoid RLS recursion
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.users u
    where u.id = uid and u.role = 'admin' and coalesce(u.is_active,true)
  );
$$;

-- 1) update_updated_at_column()
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- grants for helper
grant execute on function public.is_admin(uuid) to authenticated, anon;

-- 2) generate_order_number() -> ON0000001 style
create or replace function public.generate_order_number()
returns trigger as $$
declare
  next_num bigint;
  padded text;
begin
  if new.order_number is null or new.order_number = '' then
    next_num := nextval('public.order_number_seq');
    padded := lpad(next_num::text, 7, '0');
    new.order_number := 'ON' || padded;
  end if;
  return new;
end;
$$ language plpgsql;

-- 3) log_order_activity() - store changed fields
create or replace function public.log_order_activity()
returns trigger as $$
declare
  changes jsonb := '{}'::jsonb;
  key text;
  val_new jsonb;
  val_old jsonb;
  actor_name text;
begin
  -- Build changes json of differing columns
  for key in select key from jsonb_object_keys(to_jsonb(new)) as key loop
    val_new := to_jsonb(new)->key;
    val_old := to_jsonb(old)->key;
    if val_new is distinct from val_old then
      changes := changes || jsonb_build_object(key, jsonb_build_object('old', val_old, 'new', val_new));
    end if;
  end loop;
  select full_name into actor_name from public.users where id = auth.uid();
  insert into public.order_activity_log (id, order_id, user_id, user_name, action, details)
  values (uuid_generate_v4(), new.id, auth.uid(), coalesce(actor_name, 'system'), 'orders.updated', changes);
  return new;
end;
$$ language plpgsql;

-- 4) create_notification()
create or replace function public.create_notification()
returns trigger as $$
declare
  actor_name text;
begin
  select full_name into actor_name from public.users where id = auth.uid();

  if tg_op = 'INSERT' then
    -- Order created
    insert into public.notifications(id, user_id, title, message, type, is_read, order_id)
    values (uuid_generate_v4(), new.created_by, 'Order created',
            'Order '|| new.order_number || ' created by ' || coalesce(actor_name,'system'),
            'order_created', false, new.id);

    if new.driver_id is not null then
      insert into public.notifications(id, user_id, title, message, type, is_read, order_id)
      values (uuid_generate_v4(), new.driver_id, 'Order assigned',
              'You have been assigned order '|| new.order_number,
              'order_assigned', false, new.id);
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Assignment changed
    if new.driver_id is distinct from old.driver_id and new.driver_id is not null then
      insert into public.notifications(id, user_id, title, message, type, is_read, order_id)
      values (uuid_generate_v4(), new.driver_id, 'Order assigned',
              'You have been assigned order '|| new.order_number,
              'order_assigned', false, new.id);
    end if;

    -- Status changed
    if new.status is distinct from old.status then
      insert into public.notifications(id, user_id, title, message, type, is_read, order_id)
      select uuid_generate_v4(), u.id, 'Status changed',
             'Order '|| new.order_number || ' status: '|| old.status || ' -> '|| new.status,
             'status_changed', false, new.id
      from public.users u
      where u.role in ('admin','dispatcher')
        and u.is_active = true;
    end if;

    -- Delayed flag turned on
    if new.is_delayed = true and (old.is_delayed is distinct from true) then
      insert into public.notifications(id, user_id, title, message, type, is_read, order_id)
      select uuid_generate_v4(), u.id, 'Order delayed',
             'Order '|| new.order_number || ' marked as delayed',
             'order_delayed', false, new.id
      from public.users u
      where u.role in ('admin','dispatcher')
        and u.is_active = true;
    end if;
    return new;
  end if;
  return new;
end;
$$ language plpgsql;

-- 5) Prevent non-admin role changes by non-admins
create or replace function public.ensure_role_change_by_admin()
returns trigger as $$
declare
  is_admin boolean;
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    select exists(select 1 from public.users where id = auth.uid() and role = 'admin' and is_active = true) into is_admin;
    if not coalesce(is_admin,false) then
      raise exception 'Only admins can change roles';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- TRIGGERS
-- Auto-updated timestamps
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.update_updated_at_column();

create trigger trg_orders_set_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

create trigger trg_order_comments_set_updated_at
before update on public.order_comments
for each row execute function public.update_updated_at_column();

-- Order number generation
create trigger trg_generate_order_number
before insert on public.orders
for each row execute function public.generate_order_number();

-- Activity logging
create trigger trg_log_order_activity
after update on public.orders
for each row execute function public.log_order_activity();

-- Notifications
create trigger trg_create_notification_on_orders
after insert or update on public.orders
for each row execute function public.create_notification();

-- Users role guard
create trigger trg_ensure_role_change_by_admin
before update on public.users
for each row execute function public.ensure_role_change_by_admin();

-- RLS POLICIES
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.order_photos enable row level security;
alter table public.order_comments enable row level security;
alter table public.order_activity_log enable row level security;
alter table public.notifications enable row level security;

-- USERS policies
-- Read own record
create policy users_read_own on public.users
for select using (id = auth.uid());
-- Admins read all (avoid recursion via helper)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_admin_read_all'
  ) THEN
    EXECUTE 'drop policy users_admin_read_all on public.users';
  END IF;
END $$;
create policy users_admin_read_all on public.users
for select using (public.is_admin(auth.uid()));
-- Update own (role change blocked by trigger)
create policy users_update_own on public.users
for update using (id = auth.uid())
with check (id = auth.uid());
-- Admins update any (avoid recursion via helper)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_admin_update_any'
  ) THEN
    EXECUTE 'drop policy users_admin_update_any on public.users';
  END IF;
END $$;
create policy users_admin_update_any on public.users
for update using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ORDERS policies
-- Admins full access
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='orders_admin_all'
  ) THEN
    EXECUTE 'drop policy orders_admin_all on public.orders';
  END IF;
END $$;
create policy orders_admin_all on public.orders
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
-- Drivers read assigned orders
create policy orders_driver_read_assigned on public.orders
for select using (driver_id = auth.uid());
-- Drivers update only status checkboxes of their orders
-- Simpler RLS: allow assigned driver to update; a trigger enforces which columns may change.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='orders_driver_update_status_flags'
  ) THEN
    EXECUTE 'drop policy orders_driver_update_status_flags on public.orders';
  END IF;
END $$;

create policy orders_driver_update_status_flags on public.orders
for update
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

-- Trigger to restrict what drivers can update
create or replace function public.enforce_driver_update_restrictions()
returns trigger as $$
begin
  -- admins bypass
  if exists(select 1 from public.users where id = auth.uid() and role = 'admin' and is_active) then
    return NEW;
  end if;

  -- only assigned driver may update
  if NEW.driver_id is distinct from auth.uid() then
    raise exception 'Only assigned driver can update order';
  end if;

  -- allow only status flags and status/status_reason to change
  if (
    to_jsonb(NEW) - '{is_dispatched,is_loaded,is_notified,is_delayed,is_cancelled,is_delivered,status,status_reason}'::text[]
  ) <> (
    to_jsonb(OLD) - '{is_dispatched,is_loaded,is_notified,is_delayed,is_cancelled,is_delivered,status,status_reason}'::text[]
  ) then
    raise exception 'Drivers may only update status flags and status fields';
  end if;

  return NEW;
end;
$$ language plpgsql;

-- attach trigger
DROP TRIGGER IF EXISTS trg_enforce_driver_update_restrictions ON public.orders;
create trigger trg_enforce_driver_update_restrictions
before update on public.orders
for each row execute function public.enforce_driver_update_restrictions();

-- No delete policy for drivers => cannot delete

-- ORDER_PHOTOS policies
-- Authenticated users can read
create policy order_photos_read_auth on public.order_photos
for select using (auth.uid() is not null);
-- Admins and order driver can insert
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_photos' AND policyname='order_photos_insert_admin_or_driver'
  ) THEN
    EXECUTE 'drop policy order_photos_insert_admin_or_driver on public.order_photos';
  END IF;
END $$;
create policy order_photos_insert_admin_or_driver on public.order_photos
for insert with check (
  public.is_admin(auth.uid())
  or exists(select 1 from public.orders o where o.id = order_id and o.driver_id = auth.uid())
);
-- Admins and order driver can delete
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_photos' AND policyname='order_photos_delete_admin_or_driver'
  ) THEN
    EXECUTE 'drop policy order_photos_delete_admin_or_driver on public.order_photos';
  END IF;
END $$;
create policy order_photos_delete_admin_or_driver on public.order_photos
for delete using (
  public.is_admin(auth.uid())
  or exists(select 1 from public.orders o where o.id = order_id and o.driver_id = auth.uid())
);

-- ORDER_COMMENTS policies
-- Read comments on accessible orders (admin or assigned driver)
create policy order_comments_read_accessible on public.order_comments
for select using (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  or exists(select 1 from public.orders o where o.id = order_id and o.driver_id = auth.uid())
);
-- Create comments (any authenticated user)
create policy order_comments_insert_auth on public.order_comments
for insert with check (auth.uid() is not null and user_id = auth.uid());
-- Users update/delete their own comments
create policy order_comments_update_own on public.order_comments
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy order_comments_delete_own on public.order_comments
for delete using (user_id = auth.uid());

-- ORDER_ACTIVITY_LOG policies
-- Admins read all
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_activity_log' AND policyname='order_activity_admin_read_all'
  ) THEN
    EXECUTE 'drop policy order_activity_admin_read_all on public.order_activity_log';
  END IF;
END $$;
create policy order_activity_admin_read_all on public.order_activity_log
for select using (public.is_admin(auth.uid()));
-- Drivers read logs for their orders
create policy order_activity_driver_read_assigned on public.order_activity_log
for select using (
  exists(
    select 1 from public.orders o where o.id = order_id and o.driver_id = auth.uid()
  )
);

-- NOTIFICATIONS policies
-- Users read their own
create policy notifications_read_own on public.notifications
for select using (user_id = auth.uid());
-- Users update their own (e.g., mark as read)
create policy notifications_update_own on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- INITIAL DATA
insert into public.app_settings (id, key, value)
values
  (uuid_generate_v4(), 'current_week', '1'::jsonb)
, (uuid_generate_v4(), 'default_pay_rate', '4.25'::jsonb)
, (uuid_generate_v4(), 'company_name', '"Strong Containers Delivery"'::jsonb)
, (uuid_generate_v4(), 'container_types', '["40'' HC","20'' STD","40'' STD","20'' HC","45'' HC","53''"]'::jsonb)
, (uuid_generate_v4(), 'markets', '["Chicago","Indianapolis","Milwaukee","Detroit"]'::jsonb)
ON CONFLICT (key) DO NOTHING;
