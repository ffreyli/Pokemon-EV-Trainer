-- Migration: Add Postgres cache table for PokeAPI item data
-- Stores full PokeAPI /item payload so we never need to refetch for effects/details.

CREATE TABLE IF NOT EXISTS pokemon_item_cache (
    item_name TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

