-- PostgreSQL Database Setup Script
-- Run this script in psql to set up the database

-- Step 1: Create Database (run this as superuser, e.g., postgres user)
CREATE DATABASE pokemon_ev_trainer;

-- Step 2: Connect to the database
\c pokemon_ev_trainer

-- Step 3: Create Table Schema
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Step 4: Create Updated Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create Trigger
CREATE TRIGGER update_pokemon_evs_updated_at BEFORE UPDATE ON pokemon_evs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify Table Creation
\d pokemon_evs

