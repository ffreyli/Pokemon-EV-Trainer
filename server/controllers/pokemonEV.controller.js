const pool = require('../config/database.config');
const { TABLE_NAME, toSnakeCase, toCamelCase } = require('../models/pokemonEV.model');
const axios = require('axios');
const { getSpriteUrl, setSpriteUrl, hasSpriteUrl } = require('../utils/spriteCache');

module.exports.getAllPokemon = (req, res) => {
    pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY id`)
        .then((result) => {
            const allPokemon = result.rows.map(row => toCamelCase(row));
            res.status(200).json(allPokemon);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.getOnePokemon = (req, res) => {
    pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = $1`, [req.params.id])
        .then((result) => {
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Pokemon not found' });
            }
            const onePokemon = toCamelCase(result.rows[0]);
            res.status(200).json(onePokemon);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.createPokemon = (req, res) => {
    const {
        pokemonName,
        pokemonSpeciesNumber,
        description,
        hpEVs,
        attackEVs,
        defenseEVs,
        specialAttackEVs,
        specialDefenseEVs,
        speedEVs
    } = req.body;

    const query = `
        INSERT INTO ${TABLE_NAME} 
        (pokemon_name, pokemon_species_number, description, hp_evs, attack_evs, defense_evs, special_attack_evs, special_defense_evs, speed_evs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    pool.query(query, [
        pokemonName,
        pokemonSpeciesNumber,
        description || null,
        hpEVs,
        attackEVs,
        defenseEVs,
        specialAttackEVs,
        specialDefenseEVs,
        speedEVs
    ])
        .then((result) => {
            const newPokemon = toCamelCase(result.rows[0]);
            res.status(200).json(newPokemon);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.updatePokemon = (req, res) => {
    const {
        pokemonName,
        pokemonSpeciesNumber,
        description,
        hpEVs,
        attackEVs,
        defenseEVs,
        specialAttackEVs,
        specialDefenseEVs,
        speedEVs
    } = req.body;

    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (pokemonName !== undefined) {
        updates.push(`pokemon_name = $${paramCount++}`);
        values.push(pokemonName);
    }
    if (pokemonSpeciesNumber !== undefined) {
        updates.push(`pokemon_species_number = $${paramCount++}`);
        values.push(pokemonSpeciesNumber);
    }
    if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
    }
    if (hpEVs !== undefined) {
        updates.push(`hp_evs = $${paramCount++}`);
        values.push(hpEVs);
    }
    if (attackEVs !== undefined) {
        updates.push(`attack_evs = $${paramCount++}`);
        values.push(attackEVs);
    }
    if (defenseEVs !== undefined) {
        updates.push(`defense_evs = $${paramCount++}`);
        values.push(defenseEVs);
    }
    if (specialAttackEVs !== undefined) {
        updates.push(`special_attack_evs = $${paramCount++}`);
        values.push(specialAttackEVs);
    }
    if (specialDefenseEVs !== undefined) {
        updates.push(`special_defense_evs = $${paramCount++}`);
        values.push(specialDefenseEVs);
    }
    if (speedEVs !== undefined) {
        updates.push(`speed_evs = $${paramCount++}`);
        values.push(speedEVs);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const query = `
        UPDATE ${TABLE_NAME} 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
    `;

    pool.query(query, values)
        .then((result) => {
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Pokemon not found' });
            }
            const updatedPokemon = toCamelCase(result.rows[0]);
            res.status(200).json(updatedPokemon);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.deletePokemon = (req, res) => {
    pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = $1 RETURNING *`, [req.params.id])
        .then((result) => {
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Pokemon not found' });
            }
            res.status(200).json({ message: 'Pokemon deleted successfully', deleted: toCamelCase(result.rows[0]) });
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.getPokemonSprite = (req, res) => {
    const speciesNumber = parseInt(req.params.speciesNumber);
    
    // Validate species number
    if (isNaN(speciesNumber) || speciesNumber < 1) {
        return res.status(400).json({ error: 'Invalid Pokemon species number' });
    }
    
    // Check cache first
    if (hasSpriteUrl(speciesNumber)) {
        const cachedUrl = getSpriteUrl(speciesNumber);
        return res.status(200).json({ spriteUrl: cachedUrl });
    }
    
    // Fetch from PokeAPI if not cached
    axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesNumber}`)
        .then((response) => {
            const spriteUrl = response.data.sprites.front_default;
            
            // If sprite URL exists, cache it and return
            if (spriteUrl) {
                setSpriteUrl(speciesNumber, spriteUrl);
                res.status(200).json({ spriteUrl: spriteUrl });
            } else {
                res.status(404).json({ error: 'Sprite URL not found for this Pokemon' });
            }
        })
        .catch((err) => {
            // Handle PokeAPI errors
            if (err.response && err.response.status === 404) {
                res.status(404).json({ error: 'Pokemon not found' });
            } else {
                console.error('Error fetching Pokemon sprite:', err);
                res.status(500).json({ error: 'Failed to fetch Pokemon sprite' });
            }
        })
}
