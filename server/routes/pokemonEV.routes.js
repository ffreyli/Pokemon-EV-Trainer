const pokemonEVController = require('../controllers/pokemonEV.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (app) => {
    // Protected routes - require authentication
    app.get('/api/allPokemon', authenticateToken, pokemonEVController.getAllPokemon);
    app.post('/api/newPokemon', authenticateToken, pokemonEVController.createPokemon);
    app.get('/api/onePokemon/:id', authenticateToken, pokemonEVController.getOnePokemon);
    app.put('/api/updatePokemon/:id', authenticateToken, pokemonEVController.updatePokemon);
    app.delete('/api/deletePokemon/:id', authenticateToken, pokemonEVController.deletePokemon);
    app.post('/api/pokemon/:id/apply-item', authenticateToken, pokemonEVController.applyItemToPokemon);
    app.post('/api/pokemon/:id/add-evs', authenticateToken, pokemonEVController.addEvsToPokemon);
    
    // Public routes - no authentication required
    app.get('/api/pokemon-sprite/:speciesNumber', pokemonEVController.getPokemonSprite);
    app.get('/api/pokemon-species', pokemonEVController.getPokemonSpeciesList);
    app.get('/api/pokemon-species/:speciesNumber', pokemonEVController.getPokemonSpeciesData);
    app.get('/api/natures', pokemonEVController.getNatures);
    app.post('/api/ev-items/warm-cache', pokemonEVController.warmEvItemCache);
    app.get('/api/items/:itemName/ev-effect', pokemonEVController.getItemEffect);
}
