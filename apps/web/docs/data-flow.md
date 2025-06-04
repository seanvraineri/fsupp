# SupplementScribe Data Flow

## Overview
This document explains how data flows through SupplementScribe from user input to product recommendations.

## Data Flow Steps

### 1. User Registration & Subscription
- User signs up → `auth.users` (Supabase Auth)
- Profile created → `user_profiles`
- Stripe subscription → `user_subscriptions`

### 2. Health Assessment Collection
- User completes questionnaire → `health_assessments`
  - Demographics (age, gender, height, weight)
  - Lifestyle (activity level, sleep)
  - Medical (medications, conditions, allergies)
  - Dietary (diet type, restrictions, goals)

### 3. File Upload & Processing
- User uploads files → `uploaded_files`
  - Genetic data (23andMe, AncestryDNA)
  - Lab results (PDF, images)
- Files stored in Supabase Storage
- Processing status tracked

### 4. Data Extraction (AI-Powered)
- **Lab Results Processing**:
  - AI parses PDF/images
  - Extracts biomarkers → `lab_biomarkers`
  - Stores both structured data and raw JSON
  - Common biomarkers: Vitamin D, B12, Iron, etc.

- **Genetic Data Processing**:
  - Parse genetic file formats
  - Extract SNP data → `genetic_markers`
  - Identify key variants (MTHFR, VDR, COMT, etc.)

### 5. AI Analysis
- Combines all user data → `ai_analyses`
- Input: Assessment + Biomarkers + Genetic data
- Output:
  - Risk factors
  - Deficiencies
  - Genetic considerations
  - Drug interactions

### 6. Supplement Recommendations
- AI generates recommendations → `supplement_recommendations`
- For each supplement:
  - Name & dosage
  - Frequency & timing
  - Scientific backing (PubMed IDs)
  - Drug interactions
  - Priority score

### 7. Product Search
- xAI Live Search API finds products → `product_links`
- Matches recommended supplements to real products
- Includes:
  - Product URLs
  - Pricing
  - Quality indicators
  - Dosage matching

### 8. User Interface
- Dashboard shows recommendations
- Products with purchase links
- Scientific citations
- Personalized explanations

### 9. AI Chat Support
- Conversations → `chat_conversations`
- Messages → `chat_messages`
- Has access to user's health data
- Can answer questions about recommendations

## Key Features

### Flexible Data Storage
- `biomarker_data` (JSONB): Handles any lab format
- `snp_data` (JSONB): Stores complete genetic data
- Arrays for medications, conditions, etc.

### Data Security
- Row Level Security (RLS) ensures users only see their own data
- Sensitive data encrypted at rest
- HIPAA-compliant storage

### Scalability
- Indexed for fast queries
- Efficient JSON storage for variable data
- Background processing for file uploads

## Example Data Flow

1. **User uploads 23andMe file**
   ```
   uploaded_files: {
     file_type: 'genetic',
     file_name: '23andme_raw.txt',
     processing_status: 'pending'
   }
   ```

2. **AI extracts genetic markers**
   ```
   genetic_markers: {
     mthfr_c677t: 'CT',  // Heterozygous
     vdr_variants: { 'rs1544410': 'AG' },
     snp_data: { ...thousands of SNPs... }
   }
   ```

3. **AI analyzes and finds MTHFR mutation**
   ```
   ai_analyses: {
     genetic_considerations: {
       'mthfr_mutation': 'reduced folate metabolism'
     }
   }
   ```

4. **Recommends methylfolate**
   ```
   supplement_recommendations: {
     supplement_name: 'L-Methylfolate',
     dosage_amount: 400,
     dosage_unit: 'mcg',
     recommendation_reason: 'MTHFR C677T mutation detected'
   }
   ```

5. **Finds products**
   ```
   product_links: {
     product_name: 'Thorne Methyl-Guard Plus',
     product_url: 'https://...',
     matches_dosage: true
   }
   ```

This holistic approach ensures personalized, science-backed recommendations! 