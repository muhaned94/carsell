-- Upgrade page_views to track unique visitors better
-- We will assume visitor_id is passed from the client (localStorage UUID) for anonymous users
-- or auth.uid() for logged in users.

-- 1. Create a function to get chart data for revenue
create or replace function get_financial_chart_data()
returns table (
  date text,
  revenue bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    to_char(created_at, 'YYYY-MM-DD') as date,
    count(*) * 5000 as revenue -- Assuming 5000 IQD per approved request
  from public.premium_requests
  where status = 'approved'
  and created_at > now() - interval '30 days'
  group by 1
  order by 1;
end;
$$;

-- 2. Update get_visitor_stats to be more accurate (Count DISTINCT visitor_id)
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
    -- Online: Unique visitors in last 15 mins
    (select count(distinct visitor_id) from public.page_views where created_at > now() - interval '15 minutes') as current_online,
    -- Weekly: Unique visitors in last 7 days
    (select count(distinct visitor_id) from public.page_views where created_at > now() - interval '7 days') as weekly_visits,
    -- Monthly: Unique visitors in last 30 days
    (select count(distinct visitor_id) from public.page_views where created_at > now() - interval '30 days') as monthly_visits;
end;
$$;
