// In-memory cache for PokeAPI item data
// Key: item name (lowercase, dashed)
// Value: raw PokeAPI item payload (object)
const itemDataCache = new Map();

const normalizeItemName = (name) => {
    if (!name) return '';
    return String(name).trim().toLowerCase().replace(/\s+/g, '-');
};

/**
 * Get cached item data for an item name
 * @param {string} itemName
 * @returns {object|null}
 */
const getItemData = (itemName) => {
    const key = normalizeItemName(itemName);
    return itemDataCache.get(key) || null;
};

/**
 * Store item data in cache
 * @param {string} itemName
 * @param {object} data
 */
const setItemData = (itemName, data) => {
    const key = normalizeItemName(itemName);
    if (!key) return;
    itemDataCache.set(key, data);
};

/**
 * Check if item data is cached
 * @param {string} itemName
 * @returns {boolean}
 */
const hasItemData = (itemName) => {
    const key = normalizeItemName(itemName);
    return !!key && itemDataCache.has(key);
};

module.exports = {
    normalizeItemName,
    getItemData,
    setItemData,
    hasItemData
};

