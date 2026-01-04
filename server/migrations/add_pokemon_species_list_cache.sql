-- Migration: Add Postgres cache table for PokeAPI pokemon species list
-- Used for Create/Update dropdowns so the client never calls PokeAPI directly.

CREATE TABLE IF NOT EXISTS pokemon_species_list_cache (
    id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

