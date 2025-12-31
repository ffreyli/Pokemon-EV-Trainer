# Product Specification: Pokemon EV Trainer

## Document Information

- **Version**: 2.0
- **Last Updated**: 2024
- **Status**: In Development

## 1. Executive Summary

### 1.1 Product Overview
Pokemon EV Trainer is a modern web application that helps Pokemon trainers track and manage Effort Values (EVs) for their Pokemon collections. The application provides an intuitive, game-like interface that closely matches the visual design of official Pokemon games, making it familiar and easy to use. Trainers can manage their Pokemon in storage boxes, build parties, track training progress, and connect with friends to share and compare their collections.

### 1.2 Problem Statement
In Pokemon games, Effort Values (EVs) are hidden statistics that affect a Pokemon's final stats. Trainers must manually track these values as they train their Pokemon, which can be:
- Error-prone when done manually with pen and paper
- Difficult to manage across multiple Pokemon
- Time-consuming to calculate optimal distributions
- Hard to remember which Pokemon have which EV spreads
- Lacking a way to share progress with friends

### 1.3 Solution
A full-stack web application that allows trainers to:
- Create accounts and securely store their Pokemon data
- Organize Pokemon in storage boxes that look like the in-game boxes
- Build parties of up to 6 Pokemon with EXP Share functionality
- Track all six EV stats with automatic validation
- Search for routes, Pokemon, and items to help with training
- Share Pokemon with friends and compare collections
- View Pokemon with visual sprites from the official games
- Keep a complete history of all training activities

## 2. Product Goals

### 2.1 Primary Goals
1. **Accurate EV Tracking**: Provide a reliable system for tracking EV values (0-255 per stat, 510 total max)
2. **User-Friendly Interface**: Create an intuitive interface that matches Pokemon game aesthetics
3. **Data Security**: Ensure all Pokemon data is secure and tied to user accounts
4. **Visual Recognition**: Display Pokemon sprites for easy identification
5. **Social Features**: Enable trainers to connect with friends and share their collections
6. **Training Tools**: Provide search and calculation tools to help with EV training

### 2.2 Success Metrics
- Users can successfully create accounts and log in securely
- Users can create, view, update, and delete Pokemon entries
- EV values are correctly validated and stored
- Application loads and responds within acceptable timeframes (<2s)
- Zero data loss for user entries
- Users can add friends and view public Pokemon collections
- Party management and EXP Share features work correctly

## 3. User Personas

### 3.1 Primary Persona: Competitive Trainer
- **Age**: 16-30
- **Experience**: Intermediate to advanced Pokemon knowledge
- **Goals**: Optimize Pokemon stats for competitive play, share builds with friends
- **Pain Points**: Manual tracking is tedious and error-prone, hard to compare with friends
- **Needs**: Quick access to EV values, ability to track multiple Pokemon, party management, friend comparisons

### 3.2 Secondary Persona: Casual Trainer
- **Age**: 10-25
- **Experience**: Basic Pokemon knowledge
- **Goals**: Learn about EVs and track their Pokemon's progress, have fun with friends
- **Pain Points**: Unfamiliar with EV mechanics, wants to see what friends are training
- **Needs**: Simple interface, educational value, social features

### 3.3 Returning User
- **Goals**: Access their collection from any device, continue training where they left off
- **Needs**: Reliable login, data persistence, quick access to their Pokemon

## 4. Functional Requirements

### 4.1 Authentication & User Accounts

#### 4.1.1 User Registration
- Users can create accounts with email and password
- Email validation and uniqueness checking
- Password strength requirements (minimum 8 characters)
- Account creation confirmation

#### 4.1.2 User Login
- Secure email/password authentication
- "Remember me" functionality for extended sessions
- Password reset functionality via email
- Clear error messages for invalid credentials

#### 4.1.3 Account Security
- All user data is tied to their account
- Users can only access their own Pokemon (unless marked public)
- All API endpoints require authentication (except login/register)
- Secure password storage

### 4.2 Pokemon Storage Boxes

#### 4.2.1 Box Organization
- Pokemon are organized in storage boxes (6x5 grid, 30 slots per box)
- Visual design matches official Pokemon game box interface
- Support for multiple boxes per user
- Box navigation with arrows or dropdown selector
- Empty slots are visually distinct

#### 4.2.2 Pokemon Management
- Create new Pokemon entries with species number and nickname
- View all Pokemon in box-style grid layout
- Click Pokemon to view detailed information
- Edit Pokemon nickname, description, and EV values
- Delete Pokemon entries with confirmation
- Each Pokemon can be marked as public or private

### 4.3 Party Management

#### 4.3.1 Party Creation
- Add Pokemon from storage boxes to party (maximum 6 Pokemon)
- Party displayed in horizontal row matching in-game party UI
- Remove Pokemon from party (returns to storage)
- Reorder party members

#### 4.3.2 EXP Share Feature
- Toggle EXP Share on/off for the party
- When EXP Share is ON: All party members receive EVs from defeated Pokemon
- When EXP Share is OFF: Only the Pokemon that participated receives EVs
- EXP Share state persists across sessions
- Visual indicator showing EXP Share status

### 4.4 EV Tracking

#### 4.4.1 EV Management
- Track all six EV stats: HP, Attack, Defense, Special Attack, Special Defense, Speed
- Each stat: 0-255 range
- Total EVs: 0-510 maximum
- Increment/decrement EV values with buttons or direct input
- Real-time validation to prevent exceeding limits
- Display total EV count and remaining EVs

#### 4.4.2 Activity Logging
- Every EV change is logged with timestamp
- Logs show what changed, when, and why (manual edit, defeated Pokemon, used item, EXP Share)
- Users can view activity log for each Pokemon
- Undo most recent EV change

### 4.5 Search Component

#### 4.5.1 Route Lookup
- Search for routes by name or number
- View wild Pokemon that appear on each route
- See encounter rates and EV yields for each Pokemon
- Select a wild Pokemon and apply its EV yield to party/storage Pokemon

#### 4.5.2 Pokemon Lookup
- Search for Pokemon by name or species number
- View Pokemon information including base stats and EV yield
- Apply EV yield from defeated Pokemon to selected Pokemon(s)
- Preview EV changes before applying

#### 4.5.3 Item Lookup
- Search for items by name (vitamins, Macho Brace, Power items, etc.)
- View item effects and descriptions
- Apply item effects to selected Pokemon
- Items like vitamins directly add EVs
- Items like Macho Brace affect future EV gains

### 4.6 Social Features

#### 4.6.1 Friend System
- Search for users by email
- Send friend requests to other users
- Accept or decline incoming friend requests
- View list of friends and pending requests
- Remove friends from friend list

#### 4.6.2 Pokemon Visibility
- Each Pokemon can be marked as "Public" or "Private"
- Public Pokemon are visible to friends
- Private Pokemon are only visible to the owner
- Visibility can be changed at any time
- Default visibility setting for new Pokemon

#### 4.6.3 Friend Access
- Friends can view public Pokemon from other friends
- Friends can see public Pokemon's EVs, stats, nicknames, and sprites
- Friends cannot edit or delete other users' Pokemon
- Activity logs remain private (only owner can see)
- View friends' public parties

#### 4.6.4 Rivalry Features
- View friends' public Pokemon collections
- Compare EV spreads and training progress
- See friend's party composition (if public)
- Friend comparison dashboard

### 4.7 User Interface Requirements

#### 4.7.1 Visual Design
- Interface closely matches official Pokemon game aesthetics
- Color schemes and styling match in-game menus
- Pokemon sprites displayed at appropriate sizes
- Responsive design for desktop, tablet, and mobile

#### 4.7.2 Navigation
- Clear navigation between storage boxes, party, friends, and search
- Login/registration pages
- User profile and settings
- Friend management pages

#### 4.7.3 Responsive Design
- Desktop view (1024px+)
- Tablet view (768px - 1023px)
- Mobile view (<768px)
- Touch-friendly controls for mobile devices

## 5. Technical Requirements

### 5.1 Architecture
- **Frontend**: React 18.2.0 with React Router
- **Backend**: Express.js 4.19.1, Node.js
- **Database**: PostgreSQL with pg library
- **Authentication**: JWT tokens or session-based authentication
- **API Integration**: Axios for HTTP requests, PokeAPI for Pokemon data

### 5.2 Backend Requirements
- RESTful API endpoints for all features
- Database connection pooling
- Server-side caching for PokeAPI responses
- Error handling and validation
- User authentication middleware
- Friend access authorization

### 5.3 Frontend Requirements
- React Router for client-side navigation
- Component-based architecture
- Bootstrap for responsive UI
- Authentication context for user session
- Protected routes requiring login

### 5.4 Data Requirements
- PostgreSQL database with proper schema
- Data validation at database level
- Automatic timestamp management
- Data persistence across sessions
- User data isolation and security

### 5.5 Performance Requirements
- Page load time < 2 seconds
- API response time < 500ms
- Server-side caching for PokeAPI (80%+ cache hit rate)
- Efficient database queries with proper indexing

## 6. Data Model

### 6.1 Core Tables

**users**
- User accounts with email and password
- Account creation and last login timestamps

**pokemon_evs**
- Pokemon entries with nickname, species number, description
- Six EV stats (HP, Attack, Defense, Special Attack, Special Defense, Speed)
- Visibility setting (public/private)
- Associated with user account

**parties**
- Party configuration with EXP Share toggle
- Visibility setting (public/private)
- Associated with user account

**party_members**
- Links Pokemon to party slots (1-6)
- Party member ordering

**storage_boxes**
- Box organization with box numbers and names
- Visibility setting (optional, for box-level privacy)
- Associated with user account

**ev_logs**
- Activity log for each Pokemon
- Tracks all EV changes with timestamps and reasons
- Includes EXP Share notation when applicable

**friends**
- Friend relationships between users
- Status: pending, accepted, blocked
- Friend request timestamps

**pokeapi_cache**
- Server-side cache for PokeAPI responses
- Reduces external API calls
- Cached data includes Pokemon stats, sprites, items, routes

### 6.2 Constraints
- Total EVs (sum of all six stats) cannot exceed 510
- Each individual EV stat cannot exceed 255
- Pokemon species number must be valid
- Pokemon name is required
- User data is isolated (users can only access their own data or friends' public data)

## 7. API Endpoints

### 7.1 Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user info

### 7.2 Pokemon Management
- `GET /api/allPokemon` - Get all Pokemon for authenticated user
- `GET /api/onePokemon/:id` - Get single Pokemon (user must own it or be friend)
- `POST /api/newPokemon` - Create Pokemon
- `PUT /api/updatePokemon/:id` - Update Pokemon
- `DELETE /api/deletePokemon/:id` - Delete Pokemon
- `PUT /api/pokemon/:id/visibility` - Update Pokemon visibility

### 7.3 Party Management
- `GET /api/party` - Get current party
- `POST /api/party/members` - Add Pokemon to party
- `DELETE /api/party/members/:pokemonId` - Remove Pokemon from party
- `PUT /api/party/members/reorder` - Reorder party members
- `PUT /api/party/exp-share` - Toggle EXP Share
- `PUT /api/party/visibility` - Update party visibility

### 7.4 Search Component
- `GET /api/search/routes?query=:query` - Search routes
- `GET /api/search/routes/:routeId/pokemon` - Get wild Pokemon for route
- `GET /api/search/pokemon?query=:query` - Search Pokemon
- `GET /api/search/pokemon/:speciesNumber/ev-yield` - Get EV yield
- `GET /api/search/items?query=:query` - Search items
- `GET /api/search/items/:itemName/effect` - Get item effect

### 7.5 EV Application
- `POST /api/pokemon/:id/apply-evs` - Apply EVs from defeated Pokemon or item

### 7.6 Activity Logs
- `GET /api/pokemon/:id/logs` - Get activity log for Pokemon
- `POST /api/pokemon/:id/logs/undo` - Undo most recent EV change

### 7.7 Storage Boxes
- `GET /api/boxes` - Get all storage boxes
- `POST /api/boxes` - Create new storage box
- `PUT /api/boxes/:boxId/pokemon` - Move Pokemon to box/position
- `GET /api/boxes/:boxId/pokemon` - Get all Pokemon in a box

### 7.8 Friend Management
- `GET /api/friends` - Get list of friends and pending requests
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/:requestId/accept` - Accept friend request
- `DELETE /api/friends/:requestId/decline` - Decline friend request
- `DELETE /api/friends/:friendId` - Remove friend
- `GET /api/friends/search?query=:email` - Search for users
- `GET /api/friends/:friendId/pokemon` - Get friend's public Pokemon
- `GET /api/friends/:friendId/party` - Get friend's public party

## 8. Security & Privacy

### 8.1 Authentication Security
- Passwords hashed using bcrypt
- JWT tokens or secure session cookies
- Token expiration and refresh mechanisms
- Password reset tokens with expiration
- Rate limiting on login/registration endpoints

### 8.2 Authorization
- All endpoints require authentication (except login/register)
- Users can only access their own Pokemon, parties, boxes, and logs
- Friends can access public Pokemon, public parties, and public boxes
- Friends cannot edit, delete, or see activity logs of other users' Pokemon
- Private Pokemon are only accessible to the owner

### 8.3 Data Protection
- Input validation and parameterized queries
- XSS protection via input sanitization
- CSRF protection for state-changing operations
- HTTPS required in production
- Environment variables for sensitive configuration

## 9. User Stories

### 9.1 Authentication
- As a user, I want to create an account so my Pokemon data is secure and accessible from any device
- As a user, I want to log in quickly so I can access my collection
- As a user, I want to reset my password if I forget it

### 9.2 Pokemon Management
- As a trainer, I want to create Pokemon entries so I can start tracking their EVs
- As a trainer, I want to view all my Pokemon in box-style layout so it feels familiar
- As a trainer, I want to see Pokemon sprites so I can quickly identify them
- As a trainer, I want to edit EV values so I can track training progress
- As a trainer, I want to mark Pokemon as public or private so I control who sees them

### 9.3 Party Management
- As a trainer, I want to add Pokemon to a party so I can train multiple Pokemon together
- As a trainer, I want to toggle EXP Share so all party members get EVs from battles
- As a trainer, I want to see my party displayed like in the games

### 9.4 Training Tools
- As a trainer, I want to search for routes so I can find Pokemon that give the EVs I need
- As a trainer, I want to look up Pokemon EV yields so I know what to train against
- As a trainer, I want to apply item effects so I can use vitamins and other items

### 9.5 Social Features
- As a trainer, I want to add friends so I can see their Pokemon collections
- As a trainer, I want to share my Pokemon with friends so we can compare and compete
- As a trainer, I want to keep some Pokemon private so only I can see them

## 10. Future Enhancements

### 10.1 Enhanced Authentication
- Social login with Google OAuth
- Apple Sign-In integration
- Two-factor authentication (2FA)

### 10.2 Advanced Social Features
- User profiles with display names and avatars
- Comments/reactions on friends' Pokemon
- Friend activity feed
- Leaderboards and rankings
- Achievements and badges
- Training challenges between friends

### 10.3 Training Tools
- EV spread optimizer
- Team builder
- Import/export functionality
- Route planning for optimal EV training
- Training session replays

### 10.4 Advanced Features
- Pokemon Showdown integration
- Stat calculator (predict final stats)
- Mobile app version
- Offline mode support
- Generation-specific mechanics

## 11. Glossary

- **EV (Effort Value)**: A hidden statistic in Pokemon games that affects a Pokemon's final stats. Maximum 510 total, 255 per stat (though only 252 provides benefit).
- **Species Number**: The Pokedex number of a Pokemon species (e.g., 25 for Pikachu)
- **Sprite**: A 2D image representation of a Pokemon
- **PokeAPI**: An open-source RESTful API for Pokemon data
- **EXP Share**: An in-game item that distributes experience and EVs to all party members
- **Storage Box**: In-game storage system for organizing Pokemon (6x5 grid, 30 slots)
- **Party**: The active team of up to 6 Pokemon used in battles

## 12. Technology Versions

- Node.js: v14+
- React: 18.2.0
- Express: 4.19.1
- PostgreSQL: 12+
- Bootstrap: 5.3.3
- Authentication: jsonwebtoken 9.0+ or express-session 1.17+
- Password Hashing: bcrypt 5.1+
