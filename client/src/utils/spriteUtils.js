/**
 * Build the sprite URL for a given Pokemon species number.
 * Returns an empty string if the species number is invalid or out of bounds.
 *
 * @param {number|string} speciesNumber - The Pokemon species number
 * @param {number|null} [maxPokemonId] - Optional upper bound for valid species numbers
 * @returns {string} The sprite URL or empty string if invalid
 */
export function spriteUrlForSpecies(speciesNumber, maxPokemonId = null) {
    const n = parseInt(speciesNumber);
    if (Number.isNaN(n) || n < 1) return '';
    if (typeof maxPokemonId === 'number' && n > maxPokemonId) return '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;
}
