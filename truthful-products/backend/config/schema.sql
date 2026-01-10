-- ClearPick.ai Database Schema
-- PostgreSQL tables for product intelligence

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    asin VARCHAR(50),          -- Amazon ID
    launch_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dossiers table - AI analysis results
CREATE TABLE IF NOT EXISTS dossiers (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    
    -- Scores (0-100)
    overall_score INTEGER,
    quality_score INTEGER,
    value_score INTEGER,
    reliability_score INTEGER,
    
    -- Analysis
    summary TEXT,
    pros JSONB,                 -- ["pro 1", "pro 2"]
    cons JSONB,                 -- ["con 1", "con 2"]
    common_failures JSONB,      -- [{"issue": "...", "frequency": "...", "severity": "..."}]
    
    -- Recommendations
    best_for JSONB,             -- ["use case 1", "use case 2"]
    not_recommended_for JSONB, -- ["scenario 1", "scenario 2"]
    
    -- Meta
    total_reviews INTEGER DEFAULT 0,
    confidence_score INTEGER,
    status VARCHAR(20) DEFAULT 'building', -- 'building', 'ready', 'updating'
    last_updated TIMESTAMP DEFAULT NOW(),
    next_update_due TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table - collected from various sources
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    source VARCHAR(50),         -- 'reddit', 'amazon', 'youtube'
    rating INTEGER,
    text TEXT,
    author VARCHAR(255),
    url TEXT,
    sentiment_score NUMERIC(3,2), -- -1 to 1
    scraped_at TIMESTAMP DEFAULT NOW()
);

-- Background jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'active', 'completed', 'failed'
    progress INTEGER DEFAULT 0, -- 0-100
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_product_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_dossier_product ON dossiers(product_id);
CREATE INDEX IF NOT EXISTS idx_review_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_review_source ON reviews(source);
CREATE INDEX IF NOT EXISTS idx_job_status ON jobs(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
