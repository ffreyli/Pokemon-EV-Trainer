-- Migration: Add optional Pokemon metadata fields + species cache table
-- Run this if you already have an existing pokemon_evs table.

ALTER TABLE pokemon_evs
ADD COLUMN IF NOT EXISTS nature VARCHAR(32),
ADD COLUMN IF NOT EXISTS ability VARCHAR(128),
ADD COLUMN IF NOT EXISTS held_item VARCHAR(128),
ADD COLUMN IF NOT EXISTS hp_iv INTEGER CHECK (hp_iv >= 0 AND hp_iv <= 31),
ADD COLUMN IF NOT EXISTS attack_iv INTEGER CHECK (attack_iv >= 0 AND attack_iv <= 31),
ADD COLUMN IF NOT EXISTS defense_iv INTEGER CHECK (defense_iv >= 0 AND defense_iv <= 31),
ADD COLUMN IF NOT EXISTS special_attack_iv INTEGER CHECK (special_attack_iv >= 0 AND special_attack_iv <= 31),
ADD COLUMN IF NOT EXISTS special_defense_iv INTEGER CHECK (special_defense_iv >= 0 AND special_defense_iv <= 31),
ADD COLUMN IF NOT EXISTS speed_iv INTEGER CHECK (speed_iv >= 0 AND speed_iv <= 31),
ADD COLUMN IF NOT EXISTS move_1 VARCHAR(64),
ADD COLUMN IF NOT EXISTS move_2 VARCHAR(64),
ADD COLUMN IF NOT EXISTS move_3 VARCHAR(64),
ADD COLUMN IF NOT EXISTS move_4 VARCHAR(64);

CREATE TABLE IF NOT EXISTS pokemon_species_cache (
    species_number INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


