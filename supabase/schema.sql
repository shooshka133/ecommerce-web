-- Profiles table mirrors Supabase auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Individuals can view their profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Individuals can insert their profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Individuals can update their profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Products table seeded from local data (public read access)
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  category text,
  in_stock boolean default true,
  rating numeric,
  reviews integer,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.products enable row level security;

create policy "Allow public read access to products"
  on public.products
  for select
  using (true);

create policy "Service role can manage products"
  on public.products
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Cart items table storing per-user carts
create table if not exists public.cart_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.cart_items enable row level security;

create policy "Users can view their cart items"
  on public.cart_items
  for select
  using (auth.uid() = user_id);

create policy "Users can insert into their cart"
  on public.cart_items
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their cart"
  on public.cart_items
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their cart items"
  on public.cart_items
  for delete
  using (auth.uid() = user_id);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

-- Orders table populated from Stripe webhook
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  total_amount numeric not null,
  status text default 'pending',
  stripe_session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.orders enable row level security;

create policy "Users can view their orders"
  on public.orders
  for select
  using (auth.uid() = user_id);

create policy "Service role can manage orders"
  on public.orders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create index if not exists orders_user_id_idx on public.orders (user_id);
create unique index if not exists orders_stripe_session_id_idx on public.orders (stripe_session_id);

-- Order items table captures purchased product lines
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price_each numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.order_items enable row level security;

create policy "Users can view their order items"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Service role can manage order items"
  on public.order_items
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create index if not exists order_items_order_id_idx on public.order_items (order_id);

