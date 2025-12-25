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
    hp_evs INTEGER NOT NULL DEFAULT 0 CHECK (hp_evs >= 0 AND hp_evs <= 255),
    attack_evs INTEGER NOT NULL DEFAULT 0 CHECK (attack_evs >= 0 AND attack_evs <= 255),
    defense_evs INTEGER NOT NULL DEFAULT 0 CHECK (defense_evs >= 0 AND defense_evs <= 255),
    special_attack_evs INTEGER NOT NULL DEFAULT 0 CHECK (special_attack_evs >= 0 AND special_attack_evs <= 255),
    special_defense_evs INTEGER NOT NULL DEFAULT 0 CHECK (special_defense_evs >= 0 AND special_defense_evs <= 255),
    speed_evs INTEGER NOT NULL DEFAULT 0 CHECK (speed_evs >= 0 AND speed_evs <= 255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

