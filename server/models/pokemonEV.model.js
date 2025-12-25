// Table name and column mappings for PostgreSQL
const TABLE_NAME = 'pokemon_evs';

// Column names mapping (camelCase to snake_case)
const COLUMNS = {
    id: 'id',
    pokemonName: 'pokemon_name',
    pokemonSpeciesNumber: 'pokemon_species_number',
    description: 'description',
    hpEVs: 'hp_evs',
    attackEVs: 'attack_evs',
    defenseEVs: 'defense_evs',
    specialAttackEVs: 'special_attack_evs',
    specialDefenseEVs: 'special_defense_evs',
    speedEVs: 'speed_evs',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

// Helper function to convert camelCase object to snake_case for database
function toSnakeCase(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = COLUMNS[key] || key;
        result[snakeKey] = value;
    }
    return result;
}

// Helper function to convert snake_case object to camelCase for API response
function toCamelCase(row) {
    if (!row) return null;
    
    const result = {
        id: row.id,
        pokemonName: row.pokemon_name,
        pokemonSpeciesNumber: row.pokemon_species_number,
        description: row.description,
        hpEVs: row.hp_evs,
        attackEVs: row.attack_evs,
        defenseEVs: row.defense_evs,
        specialAttackEVs: row.special_attack_evs,
        specialDefenseEVs: row.special_defense_evs,
        speedEVs: row.speed_evs,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
    
    return result;
}

module.exports = {
    TABLE_NAME,
    COLUMNS,
    toSnakeCase,
    toCamelCase
};
