const express = require('express');
const cors = require('cors');

require('./config/database.config');
const pokeapiService = require('./services/pokeapi.service');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:"http://localhost:3000"
}));

// requiring routes
const pokemonEVRoutes = require('./routes/pokemonEV.routes');

// pokemonEVRoutes: exported module with API route path endpoints
// provide routes to express app
pokemonEVRoutes(app);

// Note: we intentionally do NOT warm PokeAPI pokemon count on startup.
// `pokeapiService.getPokemonCount()` will fetch lazily on first use and memoize in-process.

app.listen(8000, () => console.log(`Listening on port: 8000`));
