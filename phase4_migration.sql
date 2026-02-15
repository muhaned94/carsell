-- Create settings table
create table public.settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial exchange rate
insert into public.settings (key, value)
values ('exchange_rate', '1530')
on conflict (key) do update set value = excluded.value;

-- Add avatar_url to profiles
alter table public.profiles add column if not exists avatar_url text;

-- Enable RLS for settings
alter table public.settings enable row level security;

-- Settings policies
create policy "Settings are viewable by everyone."
  on public.settings for select
  using ( true );

create policy "Only admins can update settings."
  on public.settings for update
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
