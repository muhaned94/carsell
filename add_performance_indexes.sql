-- Database Performance Indexes for 3000+ Users
-- This script adds indexes to speed up common queries and reduce CPU usage.

-- Index for latest cars (Home page and search)
CREATE INDEX IF NOT EXISTS idx_cars_created_at_desc ON public.cars (created_at DESC);

-- Index for premium cars filtering
CREATE INDEX IF NOT EXISTS idx_cars_is_premium ON public.cars (is_premium) WHERE is_premium = true;

-- Index for car filtering by category/governorate (common in search)
CREATE INDEX IF NOT EXISTS idx_cars_governorate ON public.cars (governorate);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON public.cars (brand);

-- Note: visitor tracking indexes removed as the system is being deleted.
