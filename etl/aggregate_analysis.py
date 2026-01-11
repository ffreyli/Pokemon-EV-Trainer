#!/usr/bin/env python3
"""
ETL Script: Aggregate Pokemon EV Training Analysis
Analyzes all users' Pokemon data (anonymized, aggregate only)
"""

import os
import sys
import psycopg2
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Fallback to individual env vars for local dev
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', 5432),
        'database': os.getenv('DB_NAME', 'pokemon_ev_trainer_api'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '')
    }
else:
    DB_CONFIG = DATABASE_URL

def get_db_connection():
    """Create database connection"""
    if isinstance(DB_CONFIG, str):
        return psycopg2.connect(DB_CONFIG, sslmode='require')
    else:
        return psycopg2.connect(**DB_CONFIG)

def extract_pokemon_data():
    """Extract: Get all Pokemon data from database"""
    conn = get_db_connection()
    
    query = """
    SELECT 
        user_id,
        pokemon_name,
        pokemon_species_number,
        level,
        nature,
        held_item,
        hp_evs,
        attack_evs,
        defense_evs,
        special_attack_evs,
        special_defense_evs,
        speed_evs,
        created_at,
        updated_at
    FROM pokemon_evs
    ORDER BY created_at DESC
    """
    
    try:
        df = pd.read_sql_query(query, conn)
        return df
    finally:
        conn.close()

def transform_aggregate_stats(df):
    """Transform: Calculate aggregate statistics (anonymized)"""
    
    if df.empty:
        return {
            'total_pokemon': 0,
            'total_evs_trained': 0,
            'ev_breakdown': {},
            'popular_species': [],
            'popular_natures': [],
            'popular_items': [],
            'average_level': 0,
            'analysis_date': datetime.now().isoformat()
        }
    
    # Calculate total EVs trained across all Pokemon
    ev_columns = ['hp_evs', 'attack_evs', 'defense_evs', 
                  'special_attack_evs', 'special_defense_evs', 'speed_evs']
    df['total_evs'] = df[ev_columns].sum(axis=1)
    
    # Aggregate statistics
    stats = {
        'total_pokemon': len(df),
        'total_users': df['user_id'].nunique(),
        'total_evs_trained': int(df['total_evs'].sum()),
        
        # EV breakdown by stat type
        'ev_breakdown': {
            'hp': int(df['hp_evs'].sum()),
            'attack': int(df['attack_evs'].sum()),
            'defense': int(df['defense_evs'].sum()),
            'special_attack': int(df['special_attack_evs'].sum()),
            'special_defense': int(df['special_defense_evs'].sum()),
            'speed': int(df['speed_evs'].sum())
        },
        
        # Most popular Pokemon species (top 10)
        'popular_species': df.groupby(['pokemon_species_number', 'pokemon_name'])
            .size()
            .reset_index(name='count')
            .sort_values('count', ascending=False)
            .head(10)
            .to_dict('records'),
        
        # Most popular natures (excluding nulls)
        'popular_natures': df[df['nature'].notna()]['nature']
            .value_counts()
            .head(10)
            .to_dict(),
        
        # Most popular held items (excluding nulls)
        'popular_items': df[df['held_item'].notna()]['held_item']
            .value_counts()
            .head(10)
            .to_dict(),
        
        # Average level
        'average_level': float(df['level'].mean()),
        
        # Analysis metadata
        'analysis_date': datetime.now().isoformat()
    }
    
    return stats

def load_to_analytics_table(stats):
    """Load: Store aggregate analytics in database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create analytics table if it doesn't exist
    create_table_query = """
    CREATE TABLE IF NOT EXISTS pokemon_analytics (
        id SERIAL PRIMARY KEY,
        analysis_date TIMESTAMP NOT NULL,
        total_pokemon INTEGER NOT NULL,
        total_users INTEGER NOT NULL,
        total_evs_trained INTEGER NOT NULL,
        ev_breakdown JSONB NOT NULL,
        popular_species JSONB NOT NULL,
        popular_natures JSONB NOT NULL,
        popular_items JSONB NOT NULL,
        average_level FLOAT NOT NULL,
        raw_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    
    # Insert new analysis
    import json
    insert_query = """
    INSERT INTO pokemon_analytics 
    (analysis_date, total_pokemon, total_users, total_evs_trained, 
     ev_breakdown, popular_species, popular_natures, popular_items, 
     average_level, raw_data)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(insert_query, (
        datetime.now(),
        stats['total_pokemon'],
        stats['total_users'],
        stats['total_evs_trained'],
        json.dumps(stats['ev_breakdown']),
        json.dumps(stats['popular_species']),
        json.dumps(stats['popular_natures']),
        json.dumps(stats['popular_items']),
        stats['average_level'],
        json.dumps(stats)
    ))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✓ Analysis loaded to database")
    print(f"  - Total Pokemon: {stats['total_pokemon']}")
    print(f"  - Total Users: {stats['total_users']}")
    print(f"  - Total EVs Trained: {stats['total_evs_trained']:,}")

def main():
    """Main ETL pipeline"""
    print("=" * 60)
    print("Pokemon EV Trainer - Aggregate Analysis ETL")
    print("=" * 60)
    
    try:
        # Extract
        print("\n[1/3] Extracting Pokemon data from database...")
        df = extract_pokemon_data()
        print(f"✓ Extracted {len(df)} Pokemon records")
        
        # Transform
        print("\n[2/3] Transforming data and calculating statistics...")
        stats = transform_aggregate_stats(df)
        print("✓ Statistics calculated")
        
        # Load
        print("\n[3/3] Loading analysis to database...")
        load_to_analytics_table(stats)
        
        print("\n" + "=" * 60)
        print("ETL Pipeline Completed Successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
