-- Add admin_phone to settings
insert into public.settings (key, value)
values ('admin_phone', '07800000000')
on conflict (key) do nothing;
