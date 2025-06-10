-- Schema Compatibility Analysis and Fixes
-- For 4 Functions: parse_health_data, ai_chat, generate_analysis, embedding_worker
-- Date: 2025-01-03

-- ============================================================================
-- ANALYSIS SUMMARY
-- ============================================================================
-- 
-- FUNCTIONS ANALYZED:
-- 1. parse_health_data - Processes uploaded health files (genetic/biomarker data)
-- 2. ai_chat - Handles conversational AI with health context
-- 3. generate_analysis - Creates personalized supplement recommendations
-- 4. embedding_worker - Processes embeddings for semantic search
--
-- COMPATIBILITY ISSUES FOUND:
-- 1. Missing tables: genetic_data, lab_data, user_embeddings
-- 2. Schema mismatch: parse_health_data expects different table names than schema
-- 3. Missing RLS policies for new tables
-- 4. Waste trimming: Old tables referenced in schema but not used by functions
--
-- ============================================================================

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. CREATE MISSING TABLES
-- ============================================================================

-- Table: genetic_data (used by parse_health_data function)
-- Replaces genetic_markers table with simpler structure
CREATE TABLE IF NOT EXISTS genetic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_company TEXT, -- e.g., '23andMe', 'AncestryDNA'
    file_name TEXT,
    snp_data JSONB NOT NULL, -- {rsid: genotype} mapping
    snp_count INTEGER DEFAULT 0,
    is_interpreted BOOLEAN DEFAULT FALSE,
    
    -- Important known SNPs for quick access
    mthfr_c677t TEXT,
    mthfr_a1298c TEXT,
    comt_val158met TEXT,
    vdr_fokl TEXT,
    fads1 TEXT,
    rs429358 TEXT, -- APOE
    rs7412 TEXT,   -- APOE
    apoe_variant TEXT, -- Calculated APOE variant
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: lab_data (used by parse_health_data function)
-- Stores processed biomarker data
CREATE TABLE IF NOT EXISTS lab_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lab_name TEXT,
    test_date DATE,
    file_name TEXT,
    biomarker_data JSONB NOT NULL, -- {biomarker: value} mapping
    biomarker_count INTEGER DEFAULT 0,
    flagged_biomarkers JSONB, -- Out-of-range biomarkers with severity
    is_interpreted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_embeddings (used by embedding_worker function)
-- Stores vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS user_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- 'file', 'conversation', 'analysis'
    source_id UUID, -- References source record
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI ada-002 dimension
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- genetic_data indexes
CREATE INDEX IF NOT EXISTS idx_genetic_data_user_id ON genetic_data(user_id);
CREATE INDEX IF NOT EXISTS idx_genetic_data_source_company ON genetic_data(source_company);
CREATE INDEX IF NOT EXISTS idx_genetic_data_created_at ON genetic_data(created_at);

-- lab_data indexes
CREATE INDEX IF NOT EXISTS idx_lab_data_user_id ON lab_data(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_data_test_date ON lab_data(test_date);
CREATE INDEX IF NOT EXISTS idx_lab_data_created_at ON lab_data(created_at);

-- user_embeddings indexes
CREATE INDEX IF NOT EXISTS idx_user_embeddings_user_id ON user_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_embeddings_source_type ON user_embeddings(source_type);
CREATE INDEX IF NOT EXISTS idx_user_embeddings_source_id ON user_embeddings(source_id);

-- ============================================================================
-- 4. ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE genetic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- genetic_data policies
CREATE POLICY "genetic_data_select_policy" ON genetic_data
    FOR SELECT USING (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

CREATE POLICY "genetic_data_insert_policy" ON genetic_data
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

CREATE POLICY "genetic_data_update_policy" ON genetic_data
    FOR UPDATE USING (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

-- lab_data policies
CREATE POLICY "lab_data_select_policy" ON lab_data
    FOR SELECT USING (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

CREATE POLICY "lab_data_insert_policy" ON lab_data
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

CREATE POLICY "lab_data_update_policy" ON lab_data
    FOR UPDATE USING (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

-- user_embeddings policies
CREATE POLICY "user_embeddings_select_policy" ON user_embeddings
    FOR SELECT USING (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

CREATE POLICY "user_embeddings_insert_policy" ON user_embeddings
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'service_role' OR 
        user_id = (select auth.uid())
    );

-- ============================================================================
-- 6. UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers for new tables
CREATE TRIGGER update_genetic_data_updated_at 
    BEFORE UPDATE ON genetic_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_data_updated_at 
    BEFORE UPDATE ON lab_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. VERIFY EXISTING TABLE COMPATIBILITY
-- ============================================================================

-- Create user_uploads table if it doesn't exist (used by parse_health_data)
CREATE TABLE IF NOT EXISTS user_uploads (
    id TEXT PRIMARY KEY, -- Custom ID like timestamp
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    storage_path TEXT,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    parsed_data JSONB,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to user_uploads if they don't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_uploads' AND column_name = 'status'
    ) THEN
        ALTER TABLE user_uploads ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add parsed_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_uploads' AND column_name = 'parsed_data'
    ) THEN
        ALTER TABLE user_uploads ADD COLUMN parsed_data JSONB;
    END IF;
    
    -- Add error_message column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_uploads' AND column_name = 'error_message'
    ) THEN
        ALTER TABLE user_uploads ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- ============================================================================
-- 7. WASTE TRIMMING ANALYSIS
-- ============================================================================

-- TABLES THAT CAN BE CONSOLIDATED OR REMOVED:
--
-- 1. genetic_markers -> genetic_data (simpler structure)
-- 2. lab_biomarkers -> lab_data (more focused structure)
-- 3. uploaded_files -> user_uploads (functionality overlap)
--
-- RECOMMENDATION: 
-- - Keep existing tables for backward compatibility
-- - New functions use new table structure
-- - Migrate data gradually in a future phase

-- ============================================================================
-- 8. FUNCTION COMPATIBILITY VERIFICATION
-- ============================================================================

-- Function: parse_health_data
-- ✅ Uses: user_uploads (exists with RLS)
-- ✅ Uses: genetic_data (created above)
-- ✅ Uses: lab_data (created above)
-- ✅ Storage: user-uploads bucket (should exist)

-- Function: ai_chat  
-- ✅ Uses: chat_conversations (exists with RLS)
-- ✅ Uses: chat_messages (exists with RLS)
-- ✅ Uses: health_assessments (exists with RLS)
-- ✅ Uses: supplement_recommendations (exists with RLS)
-- ✅ Uses: genetic_markers (exists - old structure)
-- ✅ Uses: lab_biomarkers (exists - old structure)
-- ✅ Uses: uploaded_files (exists - old structure)
-- ✅ Uses: ai_analyses (exists with RLS)

-- Function: generate_analysis
-- ✅ Uses: health_assessments (exists with RLS)
-- ✅ Uses: genetic_markers (exists - old structure)
-- ✅ Uses: lab_biomarkers (exists - old structure)
-- ✅ Uses: ai_analyses (exists with RLS)
-- ✅ Uses: supplement_recommendations (exists with RLS)
-- ✅ Uses: product_links (exists with RLS)

-- Function: embedding_worker
-- ✅ Uses: user_embeddings (created above)

-- ============================================================================
-- 9. STORAGE BUCKET VERIFICATION
-- ============================================================================

-- Ensure storage bucket exists for file uploads
-- This should be created manually in Supabase dashboard or via CLI:
-- supabase storage create user-uploads --public false

-- Required bucket policies should allow:
-- - Authenticated users can upload to their own folder
-- - Service role can read/write all files
-- - Users can only access their own files

-- ============================================================================
-- SUMMARY OF CHANGES MADE:
-- ============================================================================
-- 
-- ✅ Created genetic_data table with RLS policies
-- ✅ Created lab_data table with RLS policies  
-- ✅ Created user_embeddings table with RLS policies
-- ✅ Added performance indexes
-- ✅ Added automatic timestamp triggers
-- ✅ Verified user_uploads table compatibility
-- ✅ Maintained backward compatibility with existing tables
-- 
-- NEXT STEPS:
-- 1. Apply this migration to the database
-- 2. Verify storage bucket exists and has correct policies
-- 3. Test all 4 functions with real data
-- 4. Monitor performance and adjust indexes if needed
-- 5. Plan data migration from old tables to new structure (future phase)
--
-- ============================================================================ 