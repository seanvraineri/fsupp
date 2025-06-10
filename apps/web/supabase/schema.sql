-- SupplementScribe Database Schema
-- This schema handles the complete flow from user data to product recommendations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription management
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health assessments (questionnaire data)
CREATE TABLE health_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Demographics
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    height_value NUMERIC,
    height_unit TEXT CHECK (height_unit IN ('cm', 'inches')),
    weight_value NUMERIC,
    weight_unit TEXT CHECK (weight_unit IN ('kg', 'lbs')),
    
    -- Lifestyle
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
    sleep_duration NUMERIC,
    
    -- Medical (stored as arrays)
    current_medications TEXT[],
    health_conditions TEXT[],
    allergies TEXT[],
    
    -- Dietary
    diet_type TEXT CHECK (diet_type IN ('omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'other')),
    dietary_restrictions TEXT[],
    health_goals TEXT[],
    
    -- Metadata
    assessment_version TEXT DEFAULT '1.0',
    completion_time INTEGER, -- in minutes
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one active assessment per user
    UNIQUE(user_id, is_complete)
);

-- File uploads tracking
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES health_assessments(id) ON DELETE SET NULL,
    
    file_type TEXT NOT NULL CHECK (file_type IN ('genetic', 'lab_results')),
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    storage_path TEXT NOT NULL, -- Supabase storage path
    
    -- Processing status
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_error TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted biomarkers from lab results
CREATE TABLE lab_biomarkers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    
    -- Flexible JSON storage for different lab formats
    biomarker_data JSONB NOT NULL, -- Stores all extracted values
    
    -- Common biomarkers for quick queries
    vitamin_d NUMERIC,
    vitamin_b12 NUMERIC,
    iron NUMERIC,
    ferritin NUMERIC,
    magnesium NUMERIC,
    cholesterol_total NUMERIC,
    hdl NUMERIC,
    ldl NUMERIC,
    triglycerides NUMERIC,
    glucose NUMERIC,
    hba1c NUMERIC,
    tsh NUMERIC,
    
    test_date DATE,
    lab_name TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genetic markers extracted from genetic data
CREATE TABLE genetic_markers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    
    -- Store raw SNP data
    snp_data JSONB NOT NULL, -- {rsid: genotype} mapping
    
    -- Important markers for supplements
    mthfr_c677t TEXT, -- Affects folate metabolism
    mthfr_a1298c TEXT,
    vdr_variants JSONB, -- Vitamin D receptor variants
    comt_variants JSONB, -- Affects stress/mood
    apoe_variant TEXT, -- Affects lipid metabolism
    
    -- Metadata
    source_company TEXT, -- 23andMe, AncestryDNA, etc.
    chip_version TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis results
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES health_assessments(id) ON DELETE CASCADE,
    
    -- Input data references
    lab_biomarkers_id UUID REFERENCES lab_biomarkers(id),
    genetic_markers_id UUID REFERENCES genetic_markers(id),
    
    -- AI model details
    model_name TEXT NOT NULL, -- e.g., 'gpt-4', 'claude-3'
    model_version TEXT,
    prompt_template_version TEXT,
    
    -- Analysis results
    analysis_summary TEXT, -- Human-readable summary
    risk_factors JSONB, -- Identified health risks
    deficiencies JSONB, -- Identified nutrient deficiencies
    genetic_considerations JSONB, -- Based on genetic data
    interaction_warnings JSONB, -- Drug/supplement interactions
    
    -- Confidence scores
    overall_confidence NUMERIC CHECK (overall_confidence >= 0 AND overall_confidence <= 1),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplement recommendations
CREATE TABLE supplement_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    
    -- Supplement details
    supplement_name TEXT NOT NULL, -- e.g., "Vitamin D3"
    dosage_amount NUMERIC NOT NULL,
    dosage_unit TEXT NOT NULL, -- e.g., "IU", "mg", "mcg"
    frequency TEXT NOT NULL, -- e.g., "daily", "twice daily"
    
    -- Recommendation details
    priority_score INTEGER CHECK (priority_score >= 1 AND priority_score <= 10),
    recommendation_reason TEXT,
    expected_benefits TEXT[],
    
    -- Scientific backing
    pubmed_ids TEXT[], -- PubMed article IDs
    evidence_quality TEXT CHECK (evidence_quality IN ('high', 'moderate', 'low')),
    
    -- Warnings
    contraindications TEXT[],
    side_effects TEXT[],
    drug_interactions TEXT[],
    
    -- Timing
    best_time_to_take TEXT, -- e.g., "morning with food"
    duration_weeks INTEGER, -- Recommended duration
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product search results from xAI
CREATE TABLE supplement_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplement_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    product_url TEXT NOT NULL,
    image_url TEXT,
    price NUMERIC,
    search_query TEXT,
    relevance_score NUMERIC,
    matches_dosage BOOLEAN DEFAULT FALSE,
    third_party_tested BOOLEAN DEFAULT FALSE,
    gmp_certified BOOLEAN DEFAULT FALSE,
    serving_size TEXT,
    servings_per_container INTEGER,
    is_direct_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product links (linked to specific recommendations)
CREATE TABLE product_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL REFERENCES supplement_recommendations(id) ON DELETE CASCADE,
    
    -- Product details
    product_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    product_url TEXT NOT NULL,
    image_url TEXT,
    
    -- Pricing
    price NUMERIC,
    price_per_serving NUMERIC,
    currency TEXT DEFAULT 'USD',
    
    -- Product specs
    serving_size TEXT,
    servings_per_container INTEGER,
    matches_dosage BOOLEAN, -- Does it match recommended dosage?
    
    -- Quality indicators
    third_party_tested BOOLEAN,
    gmp_certified BOOLEAN,
    
    -- Search metadata
    search_query TEXT,
    search_timestamp TIMESTAMPTZ DEFAULT NOW(),
    relevance_score NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    
    -- Context used for this message
    used_health_data BOOLEAN DEFAULT FALSE,
    used_recommendations BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_health_assessments_user_id ON health_assessments(user_id);
CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_processing_status ON uploaded_files(processing_status);
CREATE INDEX idx_lab_biomarkers_user_id ON lab_biomarkers(user_id);
CREATE INDEX idx_genetic_markers_user_id ON genetic_markers(user_id);
CREATE INDEX idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX idx_supplement_recommendations_user_id ON supplement_recommendations(user_id);
CREATE INDEX idx_supplement_recommendations_active ON supplement_recommendations(user_id, is_active);
CREATE INDEX idx_supplement_products_name ON supplement_products(supplement_name);
CREATE INDEX idx_supplement_products_relevance ON supplement_products(relevance_score DESC);
CREATE INDEX idx_product_links_recommendation_id ON product_links(recommendation_id);
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE genetic_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments" ON health_assessments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own files" ON uploaded_files FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own biomarkers" ON lab_biomarkers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own genetic data" ON genetic_markers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses" ON ai_analyses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations" ON supplement_recommendations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view supplement products" ON supplement_products FOR SELECT USING (true);

CREATE POLICY "Users can view linked products" ON product_links FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM supplement_recommendations sr 
        WHERE sr.id = product_links.recommendation_id 
        AND sr.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own conversations" ON chat_conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON chat_messages FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM chat_conversations cc 
        WHERE cc.id = chat_messages.conversation_id 
        AND cc.user_id = auth.uid()
    ));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_assessments_updated_at BEFORE UPDATE ON health_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
