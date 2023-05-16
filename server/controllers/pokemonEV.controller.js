const pokemonEV = require('../models/pokemonEV.model');

module.exports.getAllPokemon = (req, res) => {
    pokemonEV.find({})
    .then((allPokemon) => {
        res.status(200).json(allPokemon);
    })
    .catch((err) => {
        res.status(400).json(err);
    })
}

module.exports.getOnePokemon = (req, res) => {
    pokemonEV.findOne({_id: req.params.id})
        .then((onePokemon) => {
            res.status(200).json(onePokemon);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.createPokemon = (req, res) => {
    pokemonEV.create(req.body)
        .then((newPokemon) => {
            res.status(200).json(newPokemon);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}

module.exports.updatePokemon = (req, res) => {
    pokemonEV.findOneAndUpdate(
        {_id: req.params.id},
        req.body,
        {new: true, runValidators: true}
    )
    .then((updatedPokemon) => {
        res.status(200).json(updatedPokemon);
    })
    .catch((err) => {
        res.status(400).json(err);
    })
}

module.exports.deletePokemon = (req, res) => {
    pokemonEV.deleteOne({_id: req.params.id})
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => {
        res.status(400).json(err);
    })
}