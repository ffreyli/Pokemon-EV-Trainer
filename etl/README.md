# Pokemon EV Trainer - ETL Pipeline

This directory contains Python ETL (Extract, Transform, Load) scripts for analyzing Pokemon EV training data.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   
   For local development, create a `.env` file in the project root with:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/pokemon_ev_trainer_api
   ```
   
   Or use individual variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pokemon_ev_trainer_api
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```
   
   For Fly.io production, the `DATABASE_URL` environment variable is already set.

3. **Create the analytics table:**
   ```bash
   cd ../server
   fly postgres connect -a pokemon-ev-trainer-db -d pokemon_ev_trainer_api
   ```
   Then run:
   ```sql
   \i migrations/add_analytics_table.sql
   ```

## Usage

### Aggregate Analysis (All Users)

Run the aggregate analysis script to analyze all users' Pokemon data (anonymized):

```bash
python aggregate_analysis.py
```

This script will:
- **Extract**: Fetch all Pokemon data from the database
- **Transform**: Calculate aggregate statistics (total Pokemon, EV breakdowns, popular species, etc.)
- **Load**: Store the results in the `pokemon_analytics` table

The analysis includes:
- Total Pokemon trained across all users
- Total EVs trained (aggregate)
- EV breakdown by stat type
- Most popular Pokemon species
- Most popular natures
- Most popular held items
- Average level

**Note**: All data is anonymized - user IDs are used only for counting unique users, not for identifying individuals.

## Running on a Schedule

You can set this up as a cron job or scheduled task to run periodically:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/Pokemon-EV-Trainer/etl && python aggregate_analysis.py
```

## Individual User Analytics

Individual user milestones are available through the web app:
- Navigate to `/milestones` in the app
- Shows your personal training statistics
- Includes charts and visualizations

**Note on Missing Data:**
- **Items Used**: Currently, we only track items currently held (`held_item`), not a history of items consumed during training. To track actual item usage, you would need to add a transaction log table.
- **Pokemon Defeated**: This is not currently tracked in the database. To add this feature, you would need to:
  1. Add a `pokemon_defeated` or `battles_won` field to the `pokemon_evs` table, OR
  2. Create a separate `battle_log` table to track battle history
