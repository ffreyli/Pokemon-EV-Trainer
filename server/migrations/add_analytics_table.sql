-- Migration: Add pokemon_analytics table for ETL aggregate analysis
-- Run this if you want to store aggregate analytics from the Python ETL script

CREATE TABLE IF NOT EXISTS pokemon_analytics (
    id SERIAL PRIMARY KEY,
    analysis_date TIMESTAMP NOT NULL,
    total_pokemon INTEGER NOT NULL,
    total_users INTEGER NOT NULL,
    total_evs_trained INTEGER NOT NULL,
    ev_breakdown JSONB NOT NULL,
    popular_species JSONB NOT NULL,
    popular_natures JSONB NOT NULL,
    popular_items JSONB NOT NULL,
    average_level FLOAT NOT NULL,
    raw_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for querying by date
CREATE INDEX IF NOT EXISTS idx_pokemon_analytics_date ON pokemon_analytics(analysis_date DESC);

-- Create index for querying latest analysis
CREATE INDEX IF NOT EXISTS idx_pokemon_analytics_created_at ON pokemon_analytics(created_at DESC);
