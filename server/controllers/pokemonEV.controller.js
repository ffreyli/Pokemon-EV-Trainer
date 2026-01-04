const pool = require('../config/database.config');
const { TABLE_NAME, toSnakeCase, toCamelCase } = require('../models/pokemonEV.model');
const axios = require('axios');
const pokeapiService = require('../services/pokeapi.service');
const { getEvItemEffect } = require('../utils/evItemEffects');

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
        
        // Warm-cache EV items once per process (only hits PokeAPI for missing cache entries).
        // This is intentionally triggered from an API call, not at startup.
        try {
            await pokeapiService.warmGen9EvItems();
        } catch (err) {
            // Best-effort; don't fail Pokémon fetch if warm-cache fails.
            console.warn('warmGen9EvItems failed:', err.message);
        }

        // Fetch Pokemon data from unified cached service (baseStats/types/spriteUrl/evYield)
        try {
            const poke = await pokeapiService.getPokemon(onePokemon.pokemonSpeciesNumber);
            onePokemon.baseStats = poke.baseStats;
            onePokemon.types = poke.types;
            onePokemon.spriteUrl = poke.spriteUrl;
            onePokemon.evYield = poke.evYield;
        } catch (err) {
            console.warn('Failed to enrich Pokemon with cached PokeAPI data:', err.message);
        }
        
        res.status(200).json(onePokemon);
    } catch (err) {
        console.error('Error fetching Pokemon:', err);
        res.status(400).json(err);
    }
}

module.exports.getPokemonSpeciesList = async (req, res) => {
    try {
        const list = await pokeapiService.getPokemonSpeciesList();
        return res.status(200).json(list);
    } catch (err) {
        console.error('Error fetching Pokemon species list:', err);
        return res.status(500).json({ error: 'Failed to fetch Pokemon species list' });
    }
};

module.exports.createPokemon = async (req, res) => {
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

    // Validate species number lower + upper bound (authoritative PokeAPI count)
    const n = parseInt(pokemonSpeciesNumber);
    if (Number.isNaN(n) || n < 1) {
        return res.status(400).json({ errors: { pokemonSpeciesNumber: { message: 'Pokemon species number must be a positive integer' } } });
    }
    try {
        const max = await pokeapiService.getPokemonCount();
        if (n > max) {
            return res.status(400).json({ errors: { pokemonSpeciesNumber: { message: `Pokemon species number must be <= ${max}` } } });
        }
    } catch (err) {
        // Best-effort: if PokeAPI is unreachable, don't block creation.
        console.warn('Failed to validate pokemonSpeciesNumber against PokeAPI count:', err.message);
    }

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

    try {
        const result = await pool.query(query, [
            pokemonName,
            n,
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
        ]);
        const newPokemon = toCamelCase(result.rows[0]);
        return res.status(200).json(newPokemon);
    } catch (err) {
        return res.status(400).json(err);
    }
}

module.exports.updatePokemon = async (req, res) => {
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
        const n = parseInt(pokemonSpeciesNumber);
        if (Number.isNaN(n) || n < 1) {
            return res.status(400).json({ errors: { pokemonSpeciesNumber: { message: 'Pokemon species number must be a positive integer' } } });
        }
        try {
            const max = await pokeapiService.getPokemonCount();
            if (n > max) {
                return res.status(400).json({ errors: { pokemonSpeciesNumber: { message: `Pokemon species number must be <= ${max}` } } });
            }
        } catch (err) {
            console.warn('Failed to validate pokemonSpeciesNumber against PokeAPI count:', err.message);
        }
        updates.push(`pokemon_species_number = $${paramCount++}`);
        values.push(n);
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

    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }
        const updatedPokemon = toCamelCase(result.rows[0]);
        return res.status(200).json(updatedPokemon);
    } catch (err) {
        return res.status(400).json(err);
    }
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

// --- Gen 9 EV item application (use items only) ---
const GEN9 = {
    perStatCap: 252,
    totalCap: 510
};

const getEvsFromPokemon = (p) => ({
    hp: p.hpEVs || 0,
    attack: p.attackEVs || 0,
    defense: p.defenseEVs || 0,
    specialAttack: p.specialAttackEVs || 0,
    specialDefense: p.specialDefenseEVs || 0,
    speed: p.speedEVs || 0
});

const totalEvs = (evs) => Object.values(evs).reduce((sum, v) => sum + (v || 0), 0);

function applyAddToStat(evs, statKey, amount) {
    const currentTotal = totalEvs(evs);
    const currentStat = evs[statKey] || 0;

    const remainingStat = GEN9.perStatCap - currentStat;
    const remainingTotal = GEN9.totalCap - currentTotal;

    const applied = Math.max(0, Math.min(amount, remainingStat, remainingTotal));
    const overflow = Math.max(0, amount - applied);

    return {
        evs: { ...evs, [statKey]: currentStat + applied },
        applied,
        overflow
    };
}

function applySubtractFromStat(evs, statKey, amount) {
    const currentStat = evs[statKey] || 0;
    const applied = Math.max(0, Math.min(amount, currentStat));
    const overflow = Math.max(0, amount - applied);
    return {
        evs: { ...evs, [statKey]: currentStat - applied },
        applied,
        overflow
    };
}

module.exports.warmEvItemCache = async (req, res) => {
    try {
        await pokeapiService.warmGen9EvItems();
        return res.status(200).json({ ok: true, warmed: pokeapiService.GEN9_EVS_ITEM_NAMES });
    } catch (err) {
        console.error('Error warming EV item cache:', err);
        return res.status(500).json({ ok: false, error: 'Failed to warm EV item cache' });
    }
};

module.exports.getItemEffect = async (req, res) => {
    try {
        // Warm-cache EV items once per process.
        await pokeapiService.warmGen9EvItems();
        const itemName = req.params.itemName;
        const itemData = await pokeapiService.getItem(itemName, { allowNetwork: false });
        const evEffect = getEvItemEffect(itemData);
        return res.status(200).json({
            itemName: itemData?.name,
            evEffect
        });
    } catch (err) {
        console.error('Error fetching item effect:', err);
        if (err?.code === 'ITEM_NOT_CACHED') {
            return res.status(400).json({ error: 'Item is not in the backend cache (unsupported item name).' });
        }
        return res.status(500).json({ error: 'Failed to fetch item effect' });
    }
};

module.exports.applyItemToPokemon = async (req, res) => {
    try {
        // Warm-cache EV items once per process.
        await pokeapiService.warmGen9EvItems();

        const pokemonId = parseInt(req.params.id);
        const itemName = req.body?.itemName;
        const quantityRaw = req.body?.quantity;
        const quantity = quantityRaw === undefined || quantityRaw === null ? 1 : parseInt(quantityRaw);

        if (Number.isNaN(pokemonId)) {
            return res.status(400).json({ error: 'Invalid Pokemon id' });
        }
        if (!itemName) {
            return res.status(400).json({ error: 'itemName is required' });
        }
        if (Number.isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ error: 'quantity must be a positive integer' });
        }

        const result = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = $1`, [pokemonId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }

        const pokemon = toCamelCase(result.rows[0]);
        const before = getEvsFromPokemon(pokemon);

        const itemData = await pokeapiService.getItem(itemName, { allowNetwork: false });
        const evEffect = getEvItemEffect(itemData);
        if (!evEffect) {
            return res.status(400).json({ error: `Item '${itemData?.name || itemName}' does not affect EVs (or is not supported).` });
        }
        if (String(evEffect.kind).startsWith('held_')) {
            return res.status(400).json({ error: `Item '${itemData?.name}' affects EVs only when held during battles (not a use-item EV change).` });
        }

        let after = { ...before };
        const warnings = [];

        if (evEffect.kind === 'use_reset_all') {
            after = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
        } else if (evEffect.kind === 'use_add') {
            const totalAmount = evEffect.amountPerUse * quantity;
            const r = applyAddToStat(after, evEffect.statKey, totalAmount);
            after = r.evs;
            if (r.overflow > 0) warnings.push(`Could not apply ${r.overflow} EV(s) due to caps.`);
        } else if (evEffect.kind === 'use_subtract') {
            const totalAmount = evEffect.amountPerUse * quantity;
            const r = applySubtractFromStat(after, evEffect.statKey, totalAmount);
            after = r.evs;
            if (r.overflow > 0) warnings.push(`Could not subtract ${r.overflow} EV(s) because the stat was already too low.`);
        } else {
            return res.status(400).json({ error: 'Unsupported EV item effect' });
        }

        // Defensive validation
        if (Object.values(after).some(v => v < 0 || v > GEN9.perStatCap)) {
            return res.status(400).json({ error: 'Resulting EVs violate per-stat cap.' });
        }
        if (totalEvs(after) > GEN9.totalCap) {
            return res.status(400).json({ error: 'Resulting EVs exceed total cap (510).' });
        }

        const updatedRow = await pool.query(
            `UPDATE ${TABLE_NAME}
             SET hp_evs = $1,
                 attack_evs = $2,
                 defense_evs = $3,
                 special_attack_evs = $4,
                 special_defense_evs = $5,
                 speed_evs = $6
             WHERE id = $7
             RETURNING *`,
            [after.hp, after.attack, after.defense, after.specialAttack, after.specialDefense, after.speed, pokemonId]
        );

        const updatedPokemon = toCamelCase(updatedRow.rows[0]);
        return res.status(200).json({
            pokemon: updatedPokemon,
            item: { name: itemData?.name, evEffect },
            warnings
        });
    } catch (err) {
        console.error('Error applying item to Pokemon:', err);
        if (err?.code === 'ITEM_NOT_CACHED') {
            return res.status(400).json({ error: 'Item is not in the backend cache (unsupported item name).' });
        }
        return res.status(500).json({ error: 'Failed to apply item' });
    }
};

module.exports.getPokemonSprite = async (req, res) => {
    try {
        const speciesNumber = parseInt(req.params.speciesNumber);

        // Validate species number (lower + upper bound)
        if (Number.isNaN(speciesNumber) || speciesNumber < 1) {
            return res.status(400).json({ error: 'Invalid Pokemon species number' });
        }
        const max = await pokeapiService.getPokemonCount();
        if (speciesNumber > max) {
            return res.status(400).json({ error: 'Invalid Pokemon species number' });
        }

        // Avoid PokeAPI entirely for sprites: compute deterministic sprite URL and cache in-memory.
        const spriteUrl = await pokeapiService.getPokemonSpriteUrl(speciesNumber);
        if (spriteUrl) return res.status(200).json({ spriteUrl });
        return res.status(404).json({ error: 'Sprite URL not found for this Pokemon' });
    } catch (err) {
        console.error('Error fetching Pokemon sprite:', err);
        return res.status(500).json({ error: 'Failed to fetch Pokemon sprite' });
    }
}
