-- Create table for tracking page views
create table public.page_views (
  id uuid default gen_random_uuid() primary key,
  visitor_id uuid default auth.uid(), -- Optional: track logged-in users
  path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Policies
create policy "Anyone can insert page views"
  on public.page_views for insert
  with check ( true );

create policy "Admins can view page views"
  on public.page_views for select
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Create a function to get visitor stats
create or replace function get_visitor_stats()
returns table (
  current_online bigint,
  weekly_visits bigint,
  monthly_visits bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    (select count(distinct visitor_id) from public.page_views where created_at > now() - interval '15 minutes') as current_online,
    (select count(*) from public.page_views where created_at > now() - interval '7 days') as weekly_visits,
    (select count(*) from public.page_views where created_at > now() - interval '30 days') as monthly_visits;
end;
$$;
