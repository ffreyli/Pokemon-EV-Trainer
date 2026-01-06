# Pokémon EV Trainer

A modern web application that helps Pokémon trainers track and manage Effort Values (EVs) for their Pokémon collections. Built with a beautiful interface that matches the look and feel of official Pokémon games, this app makes EV training easier, more organized, and more fun.

## What is Pokémon EV Trainer?

Pokémon EV Trainer is a tool for Pokémon players who want to:
- **Track their training progress** - Keep detailed records of EV training for all their Pokémon
- **Organize their collection** - Store Pokémon in boxes just like in the games
- **Train efficiently** - Use party management and EXP Share to train multiple Pokémon at once
- **Find training spots** - Search for routes and Pokémon to plan optimal training sessions
- **Connect with friends** - Share your Pokémon collection and compare progress with other trainers


## Getting Started

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 14 or higher) installed on your computer
- **PostgreSQL** (version 12 or higher) database installed
- A code editor (like VS Code) if you're setting up for development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pokemon-EV-Trainer
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up the database**
   
   **Option A: New Installation (recommended)**
   
   Run the full setup script from the `server/` directory:
   ```bash
   cd server
   psql -U postgres -f database_setup.sql
   ```
   
   This script will:
   - Create the `pokemon_ev_trainer` database
   - Create all required tables (`pokemon_evs`, cache tables, etc.)
   - Set up triggers for automatic timestamp updates
   - Run all migrations automatically
   
   **Option B: Existing Database (run migrations only)**
   
   If you already have an older database and just need to update the schema:
   ```bash
   cd server
   psql -U postgres -d pokemon_ev_trainer -f migrations/add_level_column.sql
   psql -U postgres -d pokemon_ev_trainer -f migrations/add_optional_fields_and_species_cache.sql
   psql -U postgres -d pokemon_ev_trainer -f migrations/add_natures_cache.sql
   psql -U postgres -d pokemon_ev_trainer -f migrations/add_pokemon_species_list_cache.sql
   psql -U postgres -d pokemon_ev_trainer -f migrations/add_item_cache.sql
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```bash
   cd server
   touch .env
   ```
   
   Add your database credentials to the `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pokemon_ev_trainer
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   ```

### Running the Application

1. **Start the backend server** (from the `server/` directory):
   ```bash
   npm start
   ```
   The server will run on `http://localhost:8000`

2. **Start the frontend** (from the `client/` directory):
   ```bash
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`

## Technology Stack

### Frontend
- **React** - Modern user interface framework
- **React Router** - Navigation between pages
- **Bootstrap** - Responsive design and styling
- **Axios** - Communication with the backend

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web server framework
- **PostgreSQL** - Database for storing all data
- **JWT** - Secure user authentication

### External Services
- **PokeAPI** - Pokémon data, sprites, and information

## Project Structure

```
Pokemon-EV-Trainer/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/ # React components (Pokemon boxes, forms, etc.)
│   │   ├── App.js      # Main application component
│   │   └── index.js    # Application entry point
│   └── package.json
├── server/              # Backend Express application
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions
│   ├── database_setup.sql
│   └── package.json
├── README.md           # This file
└── PRODUCT_SPEC.md    # Detailed product specification
```

### Technical Documentation
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## How to Use

### Adding Pokémon

Click any empty slot in your storage box (or hit "New Pokémon"). Pick a species from the dropdown, give it a nickname, and you're good to go. EVs default to 0.

### Storage & Boxes

Your Pokémon live in boxes, just like the games. Click a sprite to view its details, edit EVs with +/- buttons or type values directly, update nicknames, etc. The interface should feel familiar if you've used PC storage in any mainline game.

### Party & EXP Share

Drag up to 6 Pokémon into your party. With EXP Share toggled on, any EV gains you apply get distributed to the whole party—handy for batch training.

### Search

The search bar finds routes, Pokémon, and items:

- **Routes** — see wild encounters and their EV yields
- **Pokémon** — look up what EVs a species gives when KO'd  
- **Items** — find vitamins, power items, etc. and apply their effects directly

## Understanding EVs

**Effort Values (EVs)** are hidden statistics in Pokémon games that affect how your Pokémon's stats grow. Here's what you need to know:

- **Maximum Total**: Each Pokémon can have a maximum of 510 total EVs
- **Per Stat Limit**: Each individual stat can have up to 255 EVs (though only 252 provides benefit)
- **Stat Growth**: Every 4 EVs = +1 stat point at level 100
- **How to Gain EVs**: Defeat wild Pokémon or use items like vitamins

### Common EV Yields
- **Pidgey**: 1 Speed EV
- **Rattata**: 1 Speed EV
- **Geodude**: 1 Defense EV
- **Machop**: 1 Attack EV
- **Abra**: 1 Special Attack EV

### Items That Help
- **Vitamins** (Protein, Iron, etc.): Add +10 EVs to a specific stat
- **Macho Brace**: Doubles EV gain from battles
- **Power Items**: Add +8 EVs to a specific stat in addition to battle EVs

### Pokémon EV Information
- [Serebii - Effort Values Guide](https://www.serebii.net/games/evs.shtml)
- [Bulbapedia - Effort Values](https://bulbapedia.bulbagarden.net/wiki/Effort_values)

## Future Features

- Import/export functionality
- Enhanced social features (comments, reactions, leaderboards)
- Mobile app version
- EV build analysis and recommendations

## License

This project is open source and available for personal and educational use.
