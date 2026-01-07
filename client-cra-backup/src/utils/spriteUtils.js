/**
 * Build the sprite URL for a given Pokemon species number.
 * Returns an empty string if the species number is invalid.
 * Note: maxPokemonId check is lenient to allow variant Pokemon IDs (e.g., Alolan, Galarian forms)
 * which can have IDs higher than the base Pokemon count.
 *
 * @param {number|string} speciesNumber - The Pokemon species number (can be variant ID)
 * @param {number|null} [maxPokemonId] - Optional upper bound (only used as a soft warning, not enforced)
 * @returns {string} The sprite URL or empty string if invalid
 */
export function spriteUrlForSpecies(speciesNumber, maxPokemonId = null) {
    const n = parseInt(speciesNumber);
    if (Number.isNaN(n) || n < 1) return '';
    // Don't enforce maxPokemonId check - variants can have higher IDs
    // The sprite URL will work for any valid Pokemon ID including variants
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;
}
