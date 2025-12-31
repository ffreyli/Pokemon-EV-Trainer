// In-memory cache for Pokemon data from PokeAPI
// Key: Pokemon species number (integer)
// Value: Pokemon data object including base stats
const pokemonDataCache = new Map();

/**
 * Get cached Pokemon data for a species number
 * @param {number} speciesNumber - Pokemon species number
 * @returns {object|null} - Cached Pokemon data or null if not cached
 */
const getPokemonData = (speciesNumber) => {
    return pokemonDataCache.get(speciesNumber) || null;
};

/**
 * Store Pokemon data in cache for a species number
 * @param {number} speciesNumber - Pokemon species number
 * @param {object} data - Pokemon data to cache
 */
const setPokemonData = (speciesNumber, data) => {
    pokemonDataCache.set(speciesNumber, data);
};

/**
 * Check if Pokemon data is cached for a species number
 * @param {number} speciesNumber - Pokemon species number
 * @returns {boolean} - True if cached, false otherwise
 */
const hasPokemonData = (speciesNumber) => {
    return pokemonDataCache.has(speciesNumber);
};

/**
 * Clear cache for a specific Pokemon species or all
 * @param {number|null} speciesNumber - Pokemon species number or null to clear all
 */
const clearPokemonData = (speciesNumber = null) => {
    if (speciesNumber === null) {
        pokemonDataCache.clear();
    } else {
        pokemonDataCache.delete(speciesNumber);
    }
};

module.exports = {
    getPokemonData,
    setPokemonData,
    hasPokemonData,
    clearPokemonData
};

