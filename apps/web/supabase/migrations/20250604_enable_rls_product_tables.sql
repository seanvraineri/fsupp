-- Migration: Enable RLS on cache & score tables flagged by Supabase advisor

-- 1. health_scores -----------------------------------------------------------
ALTER TABLE IF EXISTS public.health_scores ENABLE ROW LEVEL SECURITY;

-- Allow each user to view their own current health score (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_scores') THEN
    DROP POLICY IF EXISTS "Users can read own health score" ON public.health_scores;
    CREATE POLICY "Users can read own health score" ON public.health_scores
      FOR SELECT
      USING ( auth.uid() = user_id );
  END IF;
END $$;

-- 2. health_score_history ----------------------------------------------------
ALTER TABLE IF EXISTS public.health_score_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own historical scores (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_score_history') THEN
    DROP POLICY IF EXISTS "Users can read own health score history" ON public.health_score_history;
    CREATE POLICY "Users can read own health score history" ON public.health_score_history
      FOR SELECT
      USING ( auth.uid() = user_id );
  END IF;
END $$;

-- 3. product_ingredients -----------------------------------------------------
ALTER TABLE IF EXISTS public.product_ingredients ENABLE ROW LEVEL SECURITY;
-- No policies added – external clients should not query this table directly.

-- 4. claim_cache -------------------------------------------------------------
ALTER TABLE IF EXISTS public.claim_cache ENABLE ROW LEVEL SECURITY;
-- No policies added – external clients should not query this table directly.

-- 5. product_verdict_cache ---------------------------------------------------
ALTER TABLE IF EXISTS public.product_verdict_cache ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verdict cache (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_verdict_cache') THEN
    DROP POLICY IF EXISTS "Users can read own verdict cache" ON public.product_verdict_cache;
    CREATE POLICY "Users can read own verdict cache" ON public.product_verdict_cache
      FOR SELECT
      USING ( auth.uid() = user_id );
  END IF;
END $$;

-- 6. product_checker_logs ----------------------------------------------------
ALTER TABLE IF EXISTS public.product_checker_logs ENABLE ROW LEVEL SECURITY;
-- No policies – internal logging table only.

-- Note: Service role keys used by edge functions bypass RLS, so existing
-- upsert/insert logic continues to work without modification. 
