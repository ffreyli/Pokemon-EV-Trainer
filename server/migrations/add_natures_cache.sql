-- Migration: Add Postgres cache table for PokeAPI natures
-- Run this if you already have an existing database.

CREATE TABLE IF NOT EXISTS pokemon_natures_cache (
    id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


