// In-memory cache for Pokemon sprite URLs
// Key: Pokemon species number (integer)
// Value: Sprite URL (string)
const spriteCache = new Map();

/**
 * Get cached sprite URL for a Pokemon species number
 * @param {number} speciesNumber - Pokemon species number
 * @returns {string|null} - Cached sprite URL or null if not cached
 */
const getSpriteUrl = (speciesNumber) => {
    return spriteCache.get(speciesNumber) || null;
};

/**
 * Store sprite URL in cache for a Pokemon species number
 * @param {number} speciesNumber - Pokemon species number
 * @param {string} url - Sprite URL to cache
 */
const setSpriteUrl = (speciesNumber, url) => {
    spriteCache.set(speciesNumber, url);
};

/**
 * Check if sprite URL is cached for a Pokemon species number
 * @param {number} speciesNumber - Pokemon species number
 * @returns {boolean} - True if cached, false otherwise
 */
const hasSpriteUrl = (speciesNumber) => {
    return spriteCache.has(speciesNumber);
};

module.exports = {
    getSpriteUrl,
    setSpriteUrl,
    hasSpriteUrl
};

