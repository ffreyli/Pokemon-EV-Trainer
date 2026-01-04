const { normalizeItemName } = require('./itemDataCache');

// Internal stat keys used by the app
const STAT_KEYS = {
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    specialAttack: 'specialAttack',
    specialDefense: 'specialDefense',
    speed: 'speed'
};

const STAT_LABELS = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    specialAttack: 'Sp. Atk',
    specialDefense: 'Sp. Def',
    speed: 'Speed'
};

// Note: We intentionally do NOT infer EV behavior from item categories or effect text.
// We only support an allowlist of EV-affecting items by name (Gen 9 focus).

/**
 * Normalize a PokeAPI item payload into an EV-relevant descriptor.
 * This intentionally focuses on EV-related behaviors (Gen 9).
 *
 * Returns:
 * - { kind: 'use_add', statKey, amountPerUse }
 * - { kind: 'use_subtract', statKey, amountPerUse }
 * - { kind: 'use_reset_all' }
 * - { kind: 'held_battle_multiplier', multiplier }
 * - { kind: 'held_battle_bonus', statKey, amountPerKo }
 * - null (not EV relevant)
 */
function getEvItemEffect(itemData) {
    if (!itemData) return null;

    const name = normalizeItemName(itemData.name);

    // Fresh-Start Mochi (SV DLC): reset all EVs.
    if (name === 'fresh-start-mochi') {
        return { kind: 'use_reset_all' };
    }

    // Mochi stat items behave like vitamins (add EVs).
    const mochiMap = {
        'hp-mochi': STAT_KEYS.hp,
        'muscle-mochi': STAT_KEYS.attack,
        'resist-mochi': STAT_KEYS.defense,
        'genius-mochi': STAT_KEYS.specialAttack,
        'clever-mochi': STAT_KEYS.specialDefense,
        'swift-mochi': STAT_KEYS.speed
    };
    if (mochiMap[name]) {
        return { kind: 'use_add', statKey: mochiMap[name], amountPerUse: 10 };
    }

    // Vitamins: stable names and +10 EV (Gen 9 cap handling is enforced elsewhere).
    const vitaminMap = {
        'hp-up': STAT_KEYS.hp,
        'protein': STAT_KEYS.attack,
        'iron': STAT_KEYS.defense,
        'calcium': STAT_KEYS.specialAttack,
        'zinc': STAT_KEYS.specialDefense,
        'carbos': STAT_KEYS.speed
    };
    if (vitaminMap[name]) {
        return { kind: 'use_add', statKey: vitaminMap[name], amountPerUse: 10 };
    }

    // Feathers: stable names and +1 EV.
    const featherMap = {
        'health-feather': STAT_KEYS.hp,
        'muscle-feather': STAT_KEYS.attack,
        'resist-feather': STAT_KEYS.defense,
        'genius-feather': STAT_KEYS.specialAttack,
        'clever-feather': STAT_KEYS.specialDefense,
        'swift-feather': STAT_KEYS.speed
    };
    if (featherMap[name]) {
        return { kind: 'use_add', statKey: featherMap[name], amountPerUse: 1 };
    }

    // EV-reducing berries: stable names and -10 EV.
    const berryMap = {
        'pomeg-berry': STAT_KEYS.hp,
        'kelpsy-berry': STAT_KEYS.attack,
        'qualot-berry': STAT_KEYS.defense,
        'hondew-berry': STAT_KEYS.specialAttack,
        'grepa-berry': STAT_KEYS.specialDefense,
        'tamato-berry': STAT_KEYS.speed
    };
    if (berryMap[name]) {
        return { kind: 'use_subtract', statKey: berryMap[name], amountPerUse: 10 };
    }

    // Held-item EV modifiers (Gen 9)
    // Macho Brace: doubles EV gain from battles.
    if (name === 'macho-brace') {
        return { kind: 'held_battle_multiplier', multiplier: 2 };
    }

    // Power items: add +8 EVs to a specific stat per KO (in Gen 9).
    // These items exist with stable names in PokeAPI.
    const powerItemBonusMap = {
        'power-weight': STAT_KEYS.hp,
        'power-bracer': STAT_KEYS.attack,
        'power-belt': STAT_KEYS.defense,
        'power-lens': STAT_KEYS.specialAttack,
        'power-band': STAT_KEYS.specialDefense,
        'power-anklet': STAT_KEYS.speed
    };
    if (powerItemBonusMap[name]) {
        return { kind: 'held_battle_bonus', statKey: powerItemBonusMap[name], amountPerKo: 8 };
    }

    return null;
}

module.exports = {
    getEvItemEffect,
    STAT_KEYS,
    STAT_LABELS
};

