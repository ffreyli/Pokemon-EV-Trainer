const express = require('express');
const cors = require('cors');
const app = express();

require('./config/mongoose.config');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:"http://localhost:3000"
}));

// requiring routes
const pokemonEVRoutes = require('./routes/pokemonEV.routes');

// pokemonEVRoutes: exported module with API route path endpoints
// pokemonEVRoutes(app);

app.listen(8000, () => console.log(`Listening on port: 8000`));
