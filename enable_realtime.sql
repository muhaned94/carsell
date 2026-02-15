-- Enable Realtime for specific tables
begin;
  -- Remove if already exists to avoid error or duplication
  drop publication if exists supabase_realtime;

  -- Create publication for realtime
  create publication supabase_realtime for table 
    public.premium_requests, 
    public.page_views, 
    public.profiles;
commit;
