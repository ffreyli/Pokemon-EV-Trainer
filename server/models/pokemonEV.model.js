const mongoose = require('mongoose');

const PokemonEVSchema = new mongoose.Schema({
    pokemonName: {
        type: String,
        required: [true, "Pokemon requires a name"]
    },
    pokemonSpeciesNumber: {
        type: Number,
        min: 0,
        required: [true, "Pokemon species is required"]
    },
    description: {
        type: String
    },
    hpEVs: {
        type: Number,
        min: 0,
        max: 255,
        required: [true, "An initial EV amount is required"]
    },
    attackEVs: {
        type: Number,
        min: 0,
        max: 255,
        required: [true, "An initial EV amount is required"]
    },
    defenseEVs: {
        type: Number,
        min: 0,
        max: 255,
        required: [true, "An initial EV amount is required"]
    },
    specialAttackEVs: {
        type: Number,
        min: 0,
        max: 255,
        required: [true, "An initial EV amount is required"]
    },
    specialDefenseEVs: {
        type: Number,
        min: 0,
        max: 255,
        required: [true, "An initial EV amount is required"]
    },
    speedEVs: {
        type: Number,
        min: 0,
        max: 255,
        required: [true, "An initial EV amount is required"]
    }

}, {timestamps: true});

const pokemonEV = mongoose.model('pokemonEV', PokemonEVSchema);
module.exports = pokemonEV;