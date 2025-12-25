const pokemonEVController = require('../controllers/pokemonEV.controller');

module.exports = (app) => {
    app.get('/api/allPokemon', pokemonEVController.getAllPokemon);
    app.post('/api/newPokemon', pokemonEVController.createPokemon);
    app.get('/api/onePokemon/:id', pokemonEVController.getOnePokemon);
    app.put('/api/updatePokemon/:id', pokemonEVController.updatePokemon);
    app.delete('/api/deletePokemon/:id', pokemonEVController.deletePokemon);
    app.get('/api/pokemon-sprite/:speciesNumber', pokemonEVController.getPokemonSprite);
}