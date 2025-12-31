// Table name and column mappings for PostgreSQL
const TABLE_NAME = 'pokemon_evs';

// Column names mapping (camelCase to snake_case)
const COLUMNS = {
    id: 'id',
    pokemonName: 'pokemon_name',
    pokemonSpeciesNumber: 'pokemon_species_number',
    description: 'description',
    level: 'level',
    nature: 'nature',
    ability: 'ability',
    heldItem: 'held_item',
    hpIV: 'hp_iv',
    attackIV: 'attack_iv',
    defenseIV: 'defense_iv',
    specialAttackIV: 'special_attack_iv',
    specialDefenseIV: 'special_defense_iv',
    speedIV: 'speed_iv',
    move1: 'move_1',
    move2: 'move_2',
    move3: 'move_3',
    move4: 'move_4',
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
        level: row.level,
        nature: row.nature,
        ability: row.ability,
        heldItem: row.held_item,
        hpIV: row.hp_iv,
        attackIV: row.attack_iv,
        defenseIV: row.defense_iv,
        specialAttackIV: row.special_attack_iv,
        specialDefenseIV: row.special_defense_iv,
        speedIV: row.speed_iv,
        move1: row.move_1,
        move2: row.move_2,
        move3: row.move_3,
        move4: row.move_4,
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
