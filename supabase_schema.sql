-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create cars table
create table public.cars (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  price numeric not null,
  governorate text not null,
  brand text not null,
  year int not null,
  transmission text not null, -- 'automatic', 'manual'
  fuel_type text not null, -- 'petrol', 'diesel', 'electric', 'hybrid'
  description text,
  images text[] default '{}',
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.cars enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Cars policies
create policy "Cars are viewable by everyone."
  on public.cars for select
  using ( true );

create policy "Users can insert their own cars."
  on public.cars for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own cars."
  on public.cars for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own cars."
  on public.cars for delete
  using ( auth.uid() = user_id );

-- Storage bucket for car images
insert into storage.buckets (id, name, public)
values ('cars', 'cars', true)
on conflict (id) do nothing;

create policy "Anyone can view car images"
  on storage.objects for select
  using ( bucket_id = 'cars' );

create policy "Authenticated users can upload car images"
  on storage.objects for insert
  with check ( bucket_id = 'cars' and auth.role() = 'authenticated' );

create policy "Users can update their own car images"
  on storage.objects for update
  using ( bucket_id = 'cars' and auth.uid() = owner );

create policy "Users can delete their own car images"
  on storage.objects for delete
  using ( bucket_id = 'cars' and auth.uid() = owner );
