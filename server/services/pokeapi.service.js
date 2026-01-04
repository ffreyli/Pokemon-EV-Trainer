const axios = require('axios');
const pool = require('../config/database.config');

const { hasPokemonData, getPokemonData, setPokemonData } = require('../utils/pokemonDataCache');
const { hasSpriteUrl, getSpriteUrl, setSpriteUrl } = require('../utils/spriteCache');
const { hasItemData, getItemData, setItemData, normalizeItemName } = require('../utils/itemDataCache');

// Coalesce concurrent fetches so PokeAPI is only called once per resource even under load.
const inFlight = new Map(); // key -> Promise

// Pokemon species list (name + speciesNumber). Cached for server uptime and persisted to DB if available.
let pokemonSpeciesListMem = null;

// PokeAPI pokemon count (upper bound for valid /pokemon/{id} ids). Cached for server uptime.
let pokemonCountMem = null;

/**
 * Read the cached pokemon count without triggering a network request.
 * Returns null if the count hasn't been fetched yet in this process.
 */
function getPokemonCountCached() {
    return (typeof pokemonCountMem === 'number' && pokemonCountMem > 0) ? pokemonCountMem : null;
}

// EV items we intentionally warm-cache (by name) on first EV-item API usage.
// These correspond to the user-provided list.
const GEN9_EVS_ITEM_NAMES = [
    // Vitamins
    'hp-up', 'protein', 'iron', 'calcium', 'zinc', 'carbos',
    // EV reducing berries
    'pomeg-berry', 'kelpsy-berry', 'qualot-berry', 'hondew-berry', 'grepa-berry', 'tamato-berry',
    // Power items
    'power-weight', 'power-bracer', 'power-belt', 'power-lens', 'power-band', 'power-anklet',
    // Feathers
    'health-feather', 'muscle-feather', 'resist-feather', 'genius-feather', 'clever-feather', 'swift-feather'
];

let evItemsWarmStarted = false;
let evItemsWarmPromise = null;

const getOrCreateInFlight = (key, fn) => {
    if (inFlight.has(key)) return inFlight.get(key);
    const p = (async () => {
        try {
            return await fn();
        } finally {
            inFlight.delete(key);
        }
    })();
    inFlight.set(key, p);
    return p;
};

const parseSpeciesNumberFromUrl = (url) => {
    if (!url) return null;
    const m = String(url).match(/\/pokemon\/(\d+)\/?$/);
    if (!m) return null;
    const n = parseInt(m[1]);
    return Number.isNaN(n) ? null : n;
};

/**
 * Get the authoritative upper limit for valid Pokemon ids from PokeAPI.
 * Uses `GET /api/v2/pokemon?limit=1` and reads `data.count`.
 */
async function getPokemonCount() {
    const inFlightKey = 'pokemonCount';
    return getOrCreateInFlight(inFlightKey, async () => {
        if (typeof pokemonCountMem === 'number' && pokemonCountMem > 0) return pokemonCountMem;
        const resp = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1');
        const countRaw = resp.data?.count;
        const count = parseInt(countRaw);
        if (Number.isNaN(count) || count < 1) {
            throw new Error('Failed to fetch valid pokemon count from PokeAPI');
        }
        pokemonCountMem = count;
        return pokemonCountMem;
    });
}

const buildPokemonCacheData = (pokeApiPokemon) => {
    const baseStats = {
        hp: pokeApiPokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
        attack: pokeApiPokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
        defense: pokeApiPokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
        specialAttack: pokeApiPokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
        specialDefense: pokeApiPokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
        speed: pokeApiPokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
    };

    const evYield = {
        hp: pokeApiPokemon.stats.find(s => s.stat.name === 'hp')?.effort || 0,
        attack: pokeApiPokemon.stats.find(s => s.stat.name === 'attack')?.effort || 0,
        defense: pokeApiPokemon.stats.find(s => s.stat.name === 'defense')?.effort || 0,
        specialAttack: pokeApiPokemon.stats.find(s => s.stat.name === 'special-attack')?.effort || 0,
        specialDefense: pokeApiPokemon.stats.find(s => s.stat.name === 'special-defense')?.effort || 0,
        speed: pokeApiPokemon.stats.find(s => s.stat.name === 'speed')?.effort || 0
    };

    const types = (pokeApiPokemon.types || []).map(t => t.type.name);
    const spriteUrl = pokeApiPokemon.sprites?.front_default || null;

    return { baseStats, evYield, types, spriteUrl };
};

async function getPokemon(speciesNumber) {
    const n = parseInt(speciesNumber);
    if (Number.isNaN(n) || n < 1) {
        throw new Error('Invalid species number');
    }
    const max = await getPokemonCount();
    if (n > max) {
        throw new Error('Invalid species number');
    }

    const inFlightKey = `pokemon:${n}`;
    return getOrCreateInFlight(inFlightKey, async () => {
        // Fast path: in-memory caches (base stats / types, sprite)
        const cachedMem = hasPokemonData(n) ? getPokemonData(n) : null;
        const cachedSprite = hasSpriteUrl(n) ? getSpriteUrl(n) : null;
        if (cachedMem && (cachedMem.spriteUrl || cachedSprite)) {
            return { ...cachedMem, spriteUrl: cachedMem.spriteUrl || cachedSprite };
        }

        // DB cache
        try {
            const cached = await pool.query(
                'SELECT data FROM pokemon_species_cache WHERE species_number = $1',
                [n]
            );
            if (cached.rows.length > 0) {
                const data = cached.rows[0].data;
                // Backfill in-memory caches for this process
                setPokemonData(n, data);
                if (data?.spriteUrl) setSpriteUrl(n, data.spriteUrl);
                return data;
            }
        } catch (err) {
            // cache table might not exist yet / migration not run; fall back to PokeAPI
            console.warn('pokemon_species_cache lookup failed (falling back to PokeAPI):', err.message);
        }

        // PokeAPI fetch (single call)
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${n}`);
        const data = buildPokemonCacheData(response.data);

        // Cache in-memory
        setPokemonData(n, data);
        if (data?.spriteUrl) setSpriteUrl(n, data.spriteUrl);

        // Persist to DB cache best-effort
        try {
            await pool.query(
                `INSERT INTO pokemon_species_cache (species_number, data)
                 VALUES ($1, $2)
                 ON CONFLICT (species_number)
                 DO UPDATE SET data = EXCLUDED.data, fetched_at = CURRENT_TIMESTAMP`,
                [n, data]
            );
        } catch (err) {
            console.warn('pokemon_species_cache upsert failed:', err.message);
        }

        return data;
    });
}

/**
 * Get a Pokemon's front sprite URL without calling PokeAPI.
 * PokeAPI's `sprites.front_default` ultimately points at the same sprite CDN, so we can
 * compute it deterministically by species number and cache it in-memory.
 */
async function getPokemonSpriteUrl(speciesNumber) {
    const n = parseInt(speciesNumber);
    if (Number.isNaN(n) || n < 1) {
        throw new Error('Invalid species number');
    }
    const max = await getPokemonCount();
    if (n > max) {
        throw new Error('Invalid species number'); 
    }

    // In-memory cache
    if (hasSpriteUrl(n)) return getSpriteUrl(n);

    // Deterministic sprite CDN URL (no PokeAPI request)
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;
    setSpriteUrl(n, url);
    return url;
}

async function getItem(itemName, options = {}) {
    const allowNetwork = options?.allowNetwork !== false; // default true
    const normalized = normalizeItemName(itemName);
    if (!normalized) throw new Error('Invalid item name');

    const inFlightKey = `item:${normalized}`;
    return getOrCreateInFlight(inFlightKey, async () => {
        // In-memory cache
        if (hasItemData(normalized)) {
            return getItemData(normalized);
        }

        // DB cache
        try {
            const cached = await pool.query(
                'SELECT data FROM pokemon_item_cache WHERE item_name = $1',
                [normalized]
            );
            if (cached.rows.length > 0) {
                const data = cached.rows[0].data;
                setItemData(normalized, data);
                return data;
            }
        } catch (err) {
            console.warn('pokemon_item_cache lookup failed (falling back to PokeAPI):', err.message);
        }

        // If network calls are disabled (e.g., after warm-cache), do not hit PokeAPI.
        if (!allowNetwork) {
            const e = new Error(`Item '${normalized}' not found in cache`);
            e.code = 'ITEM_NOT_CACHED';
            throw e;
        }

        // PokeAPI fetch (single call)
        const response = await axios.get(`https://pokeapi.co/api/v2/item/${normalized}`);
        const data = response.data;

        // Cache in-memory
        setItemData(normalized, data);

        // Persist to DB cache best-effort
        try {
            await pool.query(
                `INSERT INTO pokemon_item_cache (item_name, data)
                 VALUES ($1, $2)
                 ON CONFLICT (item_name)
                 DO UPDATE SET data = EXCLUDED.data, fetched_at = CURRENT_TIMESTAMP`,
                [normalized, data]
            );
        } catch (err) {
            console.warn('pokemon_item_cache upsert failed:', err.message);
        }

        return data;
    });
}

/**
 * Warm-cache the fixed list of Gen 9 EV items by name.
 * This runs only once per server process; each item is still individually cached in DB and memory,
 * and PokeAPI is only called if that item isn't already in the DB cache.
 */
async function warmGen9EvItems() {
    if (evItemsWarmStarted) return evItemsWarmPromise;
    evItemsWarmStarted = true;
    evItemsWarmPromise = Promise.all(GEN9_EVS_ITEM_NAMES.map((n) => getItem(n, { allowNetwork: true }))).then(() => true);
    return evItemsWarmPromise;
}

/**
 * Get the full Pokemon species list (name + speciesNumber) with caching.
 * Intended for Create/Update dropdowns so the client never hits PokeAPI directly.
 */
async function getPokemonSpeciesList() {
    const inFlightKey = 'pokemonSpeciesList';
    return getOrCreateInFlight(inFlightKey, async () => {
        if (pokemonSpeciesListMem) return pokemonSpeciesListMem;

        // DB cache
        try {
            const cached = await pool.query('SELECT data FROM pokemon_species_list_cache WHERE id = 1');
            if (cached.rows.length > 0) {
                pokemonSpeciesListMem = cached.rows[0].data;
                return pokemonSpeciesListMem;
            }
        } catch (err) {
            console.warn('pokemon_species_list_cache lookup failed (falling back to PokeAPI):', err.message);
        }

        // PokeAPI fetch (single call). We only fetch the list, not individual pokemon details.
        // Use authoritative count so this list always covers the full valid id range.
        const max = await getPokemonCount();
        const resp = await axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=${max}`);
        const results = resp.data?.results || [];
        const list = results
            .map((p, idx) => {
                const speciesNumber = parseSpeciesNumberFromUrl(p?.url) || (idx + 1);
                return { name: p?.name, speciesNumber };
            })
            .filter((p) => p?.name && typeof p.speciesNumber === 'number' && !Number.isNaN(p.speciesNumber))
            .sort((a, b) => a.speciesNumber - b.speciesNumber);

        pokemonSpeciesListMem = list;

        // Persist to DB cache best-effort
        try {
            await pool.query(
                `INSERT INTO pokemon_species_list_cache (id, data)
                 VALUES (1, $1)
                 ON CONFLICT (id)
                 DO UPDATE SET data = EXCLUDED.data, fetched_at = CURRENT_TIMESTAMP`,
                [list]
            );
        } catch (err) {
            console.warn('pokemon_species_list_cache upsert failed:', err.message);
        }

        return list;
    });
}

module.exports = {
    getPokemon,
    getPokemonSpriteUrl,
    getItem,
    warmGen9EvItems,
    getPokemonSpeciesList,
    getPokemonCount,
    getPokemonCountCached,
    GEN9_EVS_ITEM_NAMES
};

