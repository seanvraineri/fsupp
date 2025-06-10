-- Fix RLS policies for health_assessments table (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_assessments') THEN
    -- Drop the existing policy
    DROP POLICY IF EXISTS "Users can view own assessments" ON health_assessments;

    -- Create separate policies for different operations
    CREATE POLICY "Users can select own assessments" ON health_assessments 
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own assessments" ON health_assessments 
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own assessments" ON health_assessments 
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own assessments" ON health_assessments 
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
