# Pokémon EV Trainer

A modern web application that helps Pokémon trainers track and manage Effort Values (EVs) for their Pokémon collections. Built with a beautiful interface inspired by Pokémon Sword/Shield, this app makes EV training easier, more organized, and more fun.

## What is Pokémon EV Trainer?

Pokémon EV Trainer is a tool for Pokémon players who want to:
- **Track their training progress** - Keep detailed records of EV training for all their Pokémon
- **Organize their collection** - Store Pokémon in boxes just like in the games
- **Manage stats efficiently** - View IVs, EVs, natures, and calculated final stats at a glance
- **Apply items quickly** - Use vitamins, feathers, and berries to adjust EVs
- **Secure account system** - Create an account to keep your Pokémon private and synced across devices

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
   psql -U postgres -d pokemon_ev_trainer -f migrations/add_users_auth.sql
   ```

5. **Configure environment variables (local development only)**
   
   Create a `.env` file in the `server/` directory:
   ```bash
   cd server
   touch .env
   ```
   
   Add your database credentials and JWT secret to the `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pokemon_ev_trainer
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your-secret-key-change-this-in-production
   ```
   
   > **Note**: This `.env` file is only needed for local development. For production deployment, see the [Deployment](#deployment) section below.

### Running the Application (Local Development)

1. **Start the backend server** (from the `server/` directory):
   ```bash
   npm start
   ```
   The server will run on `http://localhost:8000`

2. **Start the frontend** (from the `client/` directory in a new terminal):
   ```bash
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`

## Technology Stack

### Frontend
- **React** - Modern user interface framework
- **React Router** - Navigation between pages
- **Custom CSS** - Pokémon Sword/Shield inspired styling
- **Axios** - Communication with the backend

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web server framework
- **PostgreSQL** - Database for storing all data

### External Services
- **PokeAPI** - Pokémon data, sprites, and information

## Project Structure

```
Pokemon-EV-Trainer/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/ # React components (Pokemon boxes, forms, etc.)
│   │   ├── config/     # API configuration
│   │   ├── utils/      # Helper functions
│   │   ├── App.js      # Main application component
│   │   └── index.js    # Application entry point
│   └── package.json
├── server/              # Backend Express application
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API endpoints
│   ├── services/       # PokeAPI integration
│   ├── utils/          # Helper functions (EV items, caching)
│   ├── migrations/     # Database migration scripts
│   ├── database_setup.sql
│   └── package.json
├── README.md           # This file
└── PRODUCT_SPEC.md     # Detailed product specification
```

### Technical Documentation
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## How to Use

### Adding Pokémon

1. Click the "Create Pokemon" button in the navigation or click an empty slot
2. Search for a species by typing in the search box
3. Give it a nickname and set its level, nature, ability, and held item
4. Set initial EVs and IVs
5. Add moves (optional)
6. Click "Add Pokemon"

### Viewing & Editing Pokémon

- Click any Pokémon in the box to view its details in the side panel
- The detail panel shows:
  - Sprite, name, level, and types
  - Nature, ability, and held item
  - EVs with quick +/- adjustment buttons
  - Base stats, IVs, and calculated final stats
  - Moves
- Use the **Edit** button to open the full edit form
- Use the **Delete** button to remove a Pokémon

### Quick EV Adjustment

In the detail panel, use the +/- buttons next to each stat to quickly adjust EVs by 4 points at a time. The total EV counter (max 510) is shown at the top.

### Applying Items

Use the "Apply EV Item" section in the detail panel to apply:
- **Vitamins** (Protein, Iron, etc.) - Add +10 EVs
- **Feathers** - Add +1 EV
- **EV-Reducing Berries** - Remove 10 EVs
- **Fresh-Start Mochi** - Reset all EVs to 0

## Understanding EVs

**Effort Values (EVs)** are hidden statistics in Pokémon games that affect how your Pokémon's stats grow. Here's what you need to know:

- **Maximum Total**: Each Pokémon can have a maximum of 510 total EVs
- **Per Stat Limit**: Each individual stat can have up to 252 EVs
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

## Deployment

This project is deployed with **Fly.io** (backend) and **Cloudflare Pages** (frontend).

### Backend (Fly.io)

1. Install the Fly CLI and authenticate:
   ```bash
   fly auth login
   ```

2. Set your secrets (no `.env` file needed):
   ```bash
   cd server
   fly secrets set DATABASE_URL="postgres://user:password@host:port/database"
   fly secrets set JWT_SECRET="your-secure-random-secret-key"
   ```

3. Deploy:
   ```bash
   fly deploy
   ```

### Frontend (Cloudflare Pages)

The frontend is automatically deployed to Cloudflare Pages via GitHub Actions when you push to the main branch. The deployment workflow:

1. Builds the React app from the `client/` directory
2. Deploys the `client/build` folder to Cloudflare Pages
3. Uses the Cloudflare Pages action with your API token and account ID

To deploy manually or configure:
1. Set environment variables in Cloudflare Pages dashboard:
   - `REACT_APP_API_BASE_URL` - Your backend API URL (e.g., `https://your-fly-app.fly.dev`)

2. The build output directory is `client/build`
3. Build command: `cd client && npm ci && npm run build`

> **Note**: The `.env` file in the Installation section is only for local development with a local PostgreSQL database.

## Future Features

- Party management with EXP Share EV distribution
- Route/encounter search for EV training spots
- Import/export functionality
- Social features and sharing
- Mobile app version

## License

This project is open source and available for personal and educational use.
