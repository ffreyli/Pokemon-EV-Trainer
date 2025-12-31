const pool = require('../config/database.config');
const { TABLE_NAME, toSnakeCase, toCamelCase } = require('../models/pokemonEV.model');
const axios = require('axios');
const { getSpriteUrl, setSpriteUrl, hasSpriteUrl } = require('../utils/spriteCache');
const { getPokemonData, setPokemonData, hasPokemonData } = require('../utils/pokemonDataCache');

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

module.exports.getNatures = async (req, res) => {
    try {
        // DB cache first
        try {
            const cached = await pool.query('SELECT data FROM pokemon_natures_cache WHERE id = 1');
            if (cached.rows.length > 0) {
                return res.status(200).json(cached.rows[0].data);
            }
        } catch (err) {
            // cache table might not exist yet
            console.warn('pokemon_natures_cache lookup failed (falling back to PokeAPI):', err.message);
        }

        // Fetch natures list from PokeAPI
        const listResp = await axios.get('https://pokeapi.co/api/v2/nature?limit=100');
        const results = listResp.data?.results || [];

        // Fetch nature details (increased_stat/decreased_stat)
        const details = await Promise.all(
            results.map(async (n) => {
                const name = n.name;
                const detailResp = await axios.get(`https://pokeapi.co/api/v2/nature/${name}`);
                const d = detailResp.data;

                const increased = d.increased_stat?.name || null;
                const decreased = d.decreased_stat?.name || null;

                return {
                    name,
                    increasedStat: increased, // e.g. "attack"
                    decreasedStat: decreased  // e.g. "defense"
                };
            })
        );

        // Normalize + sort for stable UX
        const normalized = details
            .map((d) => ({
                name: d.name,
                increasedStat: d.increasedStat,
                decreasedStat: d.decreasedStat
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Persist to DB cache best-effort
        try {
            await pool.query(
                `INSERT INTO pokemon_natures_cache (id, data)
                 VALUES (1, $1)
                 ON CONFLICT (id)
                 DO UPDATE SET data = EXCLUDED.data, fetched_at = CURRENT_TIMESTAMP`,
                [normalized]
            );
        } catch (err) {
            console.warn('pokemon_natures_cache upsert failed:', err.message);
        }

        return res.status(200).json(normalized);
    } catch (err) {
        console.error('Error fetching natures:', err);
        return res.status(500).json({ error: 'Failed to fetch natures' });
    }
};

module.exports.getOnePokemon = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = $1`, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }
        
        const onePokemon = toCamelCase(result.rows[0]);
        
        // Fetch base stats from PokeAPI (cached)
        const baseStatsData = await fetchPokemonBaseStats(onePokemon.pokemonSpeciesNumber);
        
        if (baseStatsData) {
            onePokemon.baseStats = baseStatsData.baseStats;
            onePokemon.types = baseStatsData.types;
        }
        
        res.status(200).json(onePokemon);
    } catch (err) {
        console.error('Error fetching Pokemon:', err);
        res.status(400).json(err);
    }
}

module.exports.createPokemon = (req, res) => {
    const {
        pokemonName,
        pokemonSpeciesNumber,
        description,
        level,
        nature,
        ability,
        heldItem,
        hpIV,
        attackIV,
        defenseIV,
        specialAttackIV,
        specialDefenseIV,
        speedIV,
        move1,
        move2,
        move3,
        move4,
        hpEVs,
        attackEVs,
        defenseEVs,
        specialAttackEVs,
        specialDefenseEVs,
        speedEVs
    } = req.body;

    const query = `
        INSERT INTO ${TABLE_NAME} 
        (pokemon_name, pokemon_species_number, description, level, nature, ability, held_item,
         hp_iv, attack_iv, defense_iv, special_attack_iv, special_defense_iv, speed_iv,
         move_1, move_2, move_3, move_4,
         hp_evs, attack_evs, defense_evs, special_attack_evs, special_defense_evs, speed_evs)
        VALUES ($1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23)
        RETURNING *
    `;

    pool.query(query, [
        pokemonName,
        pokemonSpeciesNumber,
        description || null,
        level || 100,
        nature || null,
        ability || null,
        heldItem || null,
        hpIV ?? null,
        attackIV ?? null,
        defenseIV ?? null,
        specialAttackIV ?? null,
        specialDefenseIV ?? null,
        speedIV ?? null,
        move1 || null,
        move2 || null,
        move3 || null,
        move4 || null,
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
        level,
        nature,
        ability,
        heldItem,
        hpIV,
        attackIV,
        defenseIV,
        specialAttackIV,
        specialDefenseIV,
        speedIV,
        move1,
        move2,
        move3,
        move4,
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
    if (level !== undefined) {
        updates.push(`level = $${paramCount++}`);
        values.push(level);
    }
    if (nature !== undefined) {
        updates.push(`nature = $${paramCount++}`);
        values.push(nature);
    }
    if (ability !== undefined) {
        updates.push(`ability = $${paramCount++}`);
        values.push(ability);
    }
    if (heldItem !== undefined) {
        updates.push(`held_item = $${paramCount++}`);
        values.push(heldItem);
    }
    if (hpIV !== undefined) {
        updates.push(`hp_iv = $${paramCount++}`);
        values.push(hpIV);
    }
    if (attackIV !== undefined) {
        updates.push(`attack_iv = $${paramCount++}`);
        values.push(attackIV);
    }
    if (defenseIV !== undefined) {
        updates.push(`defense_iv = $${paramCount++}`);
        values.push(defenseIV);
    }
    if (specialAttackIV !== undefined) {
        updates.push(`special_attack_iv = $${paramCount++}`);
        values.push(specialAttackIV);
    }
    if (specialDefenseIV !== undefined) {
        updates.push(`special_defense_iv = $${paramCount++}`);
        values.push(specialDefenseIV);
    }
    if (speedIV !== undefined) {
        updates.push(`speed_iv = $${paramCount++}`);
        values.push(speedIV);
    }
    if (move1 !== undefined) {
        updates.push(`move_1 = $${paramCount++}`);
        values.push(move1);
    }
    if (move2 !== undefined) {
        updates.push(`move_2 = $${paramCount++}`);
        values.push(move2);
    }
    if (move3 !== undefined) {
        updates.push(`move_3 = $${paramCount++}`);
        values.push(move3);
    }
    if (move4 !== undefined) {
        updates.push(`move_4 = $${paramCount++}`);
        values.push(move4);
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

/**
 * Helper function to fetch Pokemon base stats from PokeAPI (with caching)
 * @param {number} speciesNumber - Pokemon species number
 * @returns {object|null} - Pokemon data with baseStats and types, or null on error
 */
async function fetchPokemonBaseStats(speciesNumber) {
    // DB cache first
    try {
        const cached = await pool.query(
            'SELECT data FROM pokemon_species_cache WHERE species_number = $1',
            [speciesNumber]
        );
        if (cached.rows.length > 0) {
            return cached.rows[0].data;
        }
    } catch (err) {
        // Cache table might not exist yet / migration not run; fall back to PokeAPI.
        console.warn('pokemon_species_cache lookup failed (falling back to PokeAPI):', err.message);
    }

    // Check cache first
    if (hasPokemonData(speciesNumber)) {
        return getPokemonData(speciesNumber);
    }
    
    try {
        // Fetch from PokeAPI
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesNumber}`);
        const data = response.data;
        
        // Extract base stats
        const baseStats = {
            hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
            attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
            defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
            specialAttack: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
            specialDefense: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
            speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
        };
        
        // Extract types
        const types = data.types.map(t => t.type.name);
        
        // Cache the data
        const pokemonData = { baseStats, types };
        setPokemonData(speciesNumber, pokemonData);

        // Persist to DB cache best-effort
        try {
            await pool.query(
                `INSERT INTO pokemon_species_cache (species_number, data)
                 VALUES ($1, $2)
                 ON CONFLICT (species_number)
                 DO UPDATE SET data = EXCLUDED.data, fetched_at = CURRENT_TIMESTAMP`,
                [speciesNumber, pokemonData]
            );
        } catch (err) {
            console.warn('pokemon_species_cache upsert failed:', err.message);
        }
        
        return pokemonData;
    } catch (err) {
        console.error(`Error fetching Pokemon data for species ${speciesNumber}:`, err);
        return null;
    }
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
