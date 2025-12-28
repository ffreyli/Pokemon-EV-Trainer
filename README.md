# Pokémon EV Trainer

A modern web application that helps Pokémon trainers track and manage Effort Values (EVs) for their Pokémon collections. Built with a beautiful interface that matches the look and feel of official Pokémon games, this app makes EV training easier, more organized, and more fun.

## What is Pokémon EV Trainer?

Pokémon EV Trainer is a tool for Pokémon players who want to:
- **Track their training progress** - Keep detailed records of EV training for all their Pokémon
- **Organize their collection** - Store Pokémon in boxes just like in the games
- **Train efficiently** - Use party management and EXP Share to train multiple Pokémon at once
- **Find training spots** - Search for routes and Pokémon to plan optimal training sessions
- **Connect with friends** - Share your Pokémon collection and compare progress with other trainers

## Key Features

### 🎮 Game-Like Interface
- **Storage Boxes**: Organize your Pokémon in 6x5 grids that look exactly like the in-game boxes
- **Visual Design**: Authentic Pokémon game styling with familiar colors, fonts, and layouts
- **Pokémon Sprites**: See your Pokémon with official sprites from the games

### 📊 EV Tracking
- **Complete EV Management**: Track all six stats (HP, Attack, Defense, Special Attack, Special Defense, Speed)
- **Automatic Validation**: Prevents exceeding EV limits (252 per stat, 510 total)
- **Activity Logs**: See a complete history of all your training activities
- **Real-Time Updates**: Changes save automatically as you train

### 👥 Party Management
- **Build Your Party**: Add up to 6 Pokémon to your active party
- **EXP Share**: Toggle EXP Share on/off to distribute EVs to all party members
- **Efficient Training**: Train multiple Pokémon simultaneously just like in the games

### 🔍 Training Tools
- **Route Search**: Find which wild Pokémon appear on different routes
- **Pokémon Lookup**: Search for any Pokémon to see its EV yield
- **Item Search**: Look up items like vitamins, Macho Brace, and Power items
- **Quick Application**: Apply EV gains from battles or items with one click

### 👫 Social Features
- **Friend System**: Add other trainers as friends
- **Share Your Collection**: Mark Pokémon as public to share with friends
- **Privacy Control**: Keep Pokémon private if you prefer
- **Compare Progress**: View friends' public Pokémon and compare training progress
- **Friendly Competition**: See who's training the best Pokémon!

### 🔐 Secure Accounts
- **User Authentication**: Create an account to securely store your data
- **Cross-Device Access**: Access your collection from any device
- **Data Privacy**: Your Pokémon data is private and secure

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
   
   Create a PostgreSQL database and run the setup script:
   ```bash
   psql -U postgres -f server/database_setup.sql
   ```
   
   Or create it manually:
   ```sql
   CREATE DATABASE pokemon_ev_trainer;
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pokemon_ev_trainer
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your_secret_key_here
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

## How to Use

### Creating an Account
1. Click "Register" on the home page
2. Enter your email and create a password
3. Log in with your credentials

### Adding Pokémon
1. Navigate to your storage boxes
2. Click "New Pokémon" or find an empty slot
3. Enter the Pokémon's species number (Pokedex number)
4. Give it a nickname
5. Optionally add a description
6. Set initial EV values (defaults to 0)

### Managing Your Collection
- **View Pokémon**: Click on any Pokémon sprite to see detailed information
- **Edit EVs**: Use the + and - buttons or type values directly
- **Update Information**: Change nickname, description, or visibility settings
- **Organize in Boxes**: Move Pokémon between boxes to organize your collection

### Using the Party System
1. Add Pokémon from your boxes to your party (up to 6)
2. Toggle EXP Share on/off as needed
3. When you apply EV gains, all party members will receive them if EXP Share is on
4. Remove Pokémon from party to return them to storage

### Training with Search Tools
1. Use the search bar to find routes, Pokémon, or items
2. **Routes**: See which wild Pokémon appear and their EV yields
3. **Pokémon**: Look up any Pokémon to see what EVs it gives when defeated
4. **Items**: Find items like Protein, Iron, or Macho Brace and apply their effects
5. Select your target Pokémon and apply the EV gains

### Social Features
1. **Add Friends**: Search for other users by email and send friend requests
2. **Share Pokémon**: Mark Pokémon as "Public" to let friends see them
3. **View Friends' Collections**: Visit friends' profiles to see their public Pokémon
4. **Compare Progress**: See how your training compares to your friends!

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

## Features in Detail

### Storage Boxes
- Organize Pokémon in familiar 6x5 grids
- Multiple boxes for large collections
- Easy navigation between boxes
- Visual design matches Pokémon games

### Party Management
- Build a party of up to 6 Pokémon
- EXP Share distributes EVs to all party members
- Perfect for training multiple Pokémon at once
- Party displayed like in-game party screen

### Search Component
- **Routes**: Find wild Pokémon encounters by route
- **Pokémon**: Look up any Pokémon's EV yield
- **Items**: Search for training items and apply effects
- Quick application to selected Pokémon

### Social System
- Add friends and build your trainer network
- Share public Pokémon with friends
- Keep private Pokémon hidden
- Compare collections and training progress
- Friendly competition and inspiration

### Activity Logs
- Complete history of all EV changes
- See what changed, when, and why
- Track training progress over time
- Undo recent changes if needed

## API Endpoints

The application provides RESTful API endpoints for all features:

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user info

### Pokémon Management
- `GET /api/allPokemon` - Get all your Pokémon
- `GET /api/onePokemon/:id` - Get specific Pokémon
- `POST /api/newPokemon` - Create new Pokémon
- `PUT /api/updatePokemon/:id` - Update Pokémon
- `DELETE /api/deletePokemon/:id` - Delete Pokémon

### Party & Training
- `GET /api/party` - Get your party
- `POST /api/party/members` - Add Pokémon to party
- `PUT /api/party/exp-share` - Toggle EXP Share
- `POST /api/pokemon/:id/apply-evs` - Apply EV gains

### Search
- `GET /api/search/routes` - Search routes
- `GET /api/search/pokemon` - Search Pokémon
- `GET /api/search/items` - Search items

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/:friendId/pokemon` - View friend's Pokémon

See `PRODUCT_SPEC.md` for complete API documentation.

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to your branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

## Resources

### Pokémon EV Information
- [Serebii - Effort Values Guide](https://www.serebii.net/games/evs.shtml)
- [Bulbapedia - Effort Values](https://bulbapedia.bulbagarden.net/wiki/Effort_values)

### Technical Documentation
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Future Features

We're always working on improvements! Planned features include:
- EV spread optimizer and recommendations
- Team builder tools
- Import/export functionality
- Enhanced social features (comments, reactions, leaderboards)
- Mobile app version
- Offline mode support
- Integration with Pokémon Showdown

## License

This project is open source and available for personal and educational use.

## Support

If you encounter any issues or have questions:
1. Check the documentation in `PRODUCT_SPEC.md`
2. Review the API endpoints section above
3. Open an issue on GitHub with details about your problem

---

**Happy Training!** 🎮✨
