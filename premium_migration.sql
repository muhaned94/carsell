-- Create premium_requests table
create table public.premium_requests (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references public.cars(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  receipt_url text not null,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.premium_requests enable row level security;

-- Policies for premium_requests
create policy "Users can view their own requests"
  on public.premium_requests for select
  using ( auth.uid() = user_id );

create policy "Users can create requests"
  on public.premium_requests for insert
  with check ( auth.uid() = user_id );

create policy "Admins can view all requests"
  on public.premium_requests for select
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can update requests"
  on public.premium_requests for update
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Create storage bucket for receipts if not exists
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Storage policies for receipts
create policy "Authenticated users can upload receipts"
  on storage.objects for insert
  with check ( bucket_id = 'receipts' and auth.role() = 'authenticated' );

create policy "Users can view their own receipts"
  on storage.objects for select
  using ( bucket_id = 'receipts' and auth.uid() = owner );

create policy "Admins can view all receipts"
  on storage.objects for select
  using ( bucket_id = 'receipts' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );
