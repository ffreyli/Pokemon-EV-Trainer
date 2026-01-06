const express = require('express');
const cors = require('cors');

require('./config/database.config');
const pokeapiService = require('./services/pokeapi.service');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://ffreyli.github.io"
    ],
    credentials: true
}));

// requiring routes
const pokemonEVRoutes = require('./routes/pokemonEV.routes');

// Health check endpoint
app.get("/api/health", (req, res) => res.json({ ok: true }));

// pokemonEVRoutes: exported module with API route path endpoints
// provide routes to express app
pokemonEVRoutes(app);

// Note: we intentionally do NOT warm PokeAPI pokemon count on startup.
// `pokeapiService.getPokemonCount()` will fetch lazily on first use and memoize in-process.

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, "0.0.0.0", () => console.log(`Listening on port: ${PORT}`));

server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or run with a different port: PORT=8001 npm start`);
        process.exit(1);
    }
    console.error('Server failed to start:', err);
    process.exit(1);
});
