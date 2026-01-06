-- PostgreSQL Database Setup Script
-- Run this script in psql to set up the database

-- Step 1: Create Database (run this as superuser, e.g., postgres user)
CREATE DATABASE pokemon_ev_trainer;

-- Step 2: Connect to the database
\c pokemon_ev_trainer

-- Step 3: Create Users Table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create Pokemon EVs Table
CREATE TABLE pokemon_evs (
    id SERIAL PRIMARY KEY,
    pokemon_name VARCHAR(255) NOT NULL,
    pokemon_species_number INTEGER NOT NULL CHECK (pokemon_species_number >= 0),
    description TEXT,
    level INTEGER NOT NULL DEFAULT 100 CHECK (level >= 1 AND level <= 100),
    -- Optional  metadata (all nullable)
    nature VARCHAR(32),
    ability VARCHAR(128),
    held_item VARCHAR(128),
    hp_iv INTEGER CHECK (hp_iv >= 0 AND hp_iv <= 31),
    attack_iv INTEGER CHECK (attack_iv >= 0 AND attack_iv <= 31),
    defense_iv INTEGER CHECK (defense_iv >= 0 AND defense_iv <= 31),
    special_attack_iv INTEGER CHECK (special_attack_iv >= 0 AND special_attack_iv <= 31),
    special_defense_iv INTEGER CHECK (special_defense_iv >= 0 AND special_defense_iv <= 31),
    speed_iv INTEGER CHECK (speed_iv >= 0 AND speed_iv <= 31),
    move_1 VARCHAR(64),
    move_2 VARCHAR(64),
    move_3 VARCHAR(64),
    move_4 VARCHAR(64),
    -- EV stats (not null defaults to 0)
    hp_evs INTEGER NOT NULL DEFAULT 0 CHECK (hp_evs >= 0 AND hp_evs <= 255),
    attack_evs INTEGER NOT NULL DEFAULT 0 CHECK (attack_evs >= 0 AND attack_evs <= 255),
    defense_evs INTEGER NOT NULL DEFAULT 0 CHECK (defense_evs >= 0 AND defense_evs <= 255),
    special_attack_evs INTEGER NOT NULL DEFAULT 0 CHECK (special_attack_evs >= 0 AND special_attack_evs <= 255),
    special_defense_evs INTEGER NOT NULL DEFAULT 0 CHECK (special_defense_evs >= 0 AND special_defense_evs <= 255),
    speed_evs INTEGER NOT NULL DEFAULT 0 CHECK (speed_evs >= 0 AND speed_evs <= 255),
    -- User ownership
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by user
CREATE INDEX idx_pokemon_evs_user_id ON pokemon_evs(user_id);

-- Step 5: Cache Tables

-- Cached PokeAPI pokemon data (base stats + types)
CREATE TABLE IF NOT EXISTS pokemon_species_cache (
    species_number INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cached PokeAPI natures data (name + increased/decreased stat)
CREATE TABLE IF NOT EXISTS pokemon_natures_cache (
    id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cached PokeAPI pokemon species list (name + species_number)
-- Used for Create/Update dropdowns so the client never calls PokeAPI directly.
CREATE TABLE IF NOT EXISTS pokemon_species_list_cache (
    id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cached PokeAPI item data (full item payload)
CREATE TABLE IF NOT EXISTS pokemon_item_cache (
    item_name TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create Updated Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create Triggers
CREATE TRIGGER update_pokemon_evs_updated_at BEFORE UPDATE ON pokemon_evs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Run migrations (safe to run on fresh database - uses IF NOT EXISTS)
-- Note: Run this script from the server/ directory for paths to work
\i migrations/add_level_column.sql
\i migrations/add_optional_fields_and_species_cache.sql
\i migrations/add_natures_cache.sql
\i migrations/add_pokemon_species_list_cache.sql
\i migrations/add_item_cache.sql
\i migrations/add_users_auth.sql

-- Step 9: Verify Table Creation
\d users
\d pokemon_evs

