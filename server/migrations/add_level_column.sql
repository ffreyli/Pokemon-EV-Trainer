-- Migration: Add level column to pokemon_evs table
-- Run this if you already have an existing pokemon_evs table

ALTER TABLE pokemon_evs 
ADD COLUMN level INTEGER NOT NULL DEFAULT 100 CHECK (level >= 1 AND level <= 100);

