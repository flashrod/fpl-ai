import requests
import json
import pandas as pd
import pymongo
import os
from dotenv import load_dotenv  # Import dotenv

load_dotenv()


# FPL API Endpoints
FPL_API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"
FIXTURES_API_URL = "https://fantasy.premierleague.com/api/fixtures/"

# MongoDB Atlas Connection
MONGO_URI = os.getenv("MONGO_URI")  # Set this in your environment variables for security
client = pymongo.MongoClient(MONGO_URI)
db = client["fpl_db"]  # Use the correct database name

def get_fpl_data():
    """Fetch player data from FPL API and store it in MongoDB."""
    response = requests.get(FPL_API_URL)
    
    if response.status_code == 200:
        data = response.json()

        # Save raw JSON (optional)
        with open("fpl_data.json", "w") as f:
            json.dump(data, f, indent=4)

        print("✅ Data fetched successfully!")

        # Process and store data
        process_fpl_data(data)
    else:
        print("❌ Failed to fetch data")

def process_fpl_data(data):
    """Process player data and insert into MongoDB."""
    players = pd.DataFrame(data["elements"])
    teams = pd.DataFrame(data["teams"])[["id", "name"]]  # Keep only team ID and name

    # Rename columns for clarity
    players = players.rename(columns={"team": "team_id", "expected_goals": "xG", "expected_assists": "xA"})

    # Merge team names
    if "id" in teams.columns and "team_id" in players.columns:
        players = players.merge(teams, left_on="team_id", right_on="id", how="left")
        players = players.drop(columns=["team_id"])  # Drop redundant column
        if "id" in players.columns:
            players = players.drop(columns=["id"])  # Drop again if still present

    # Select required columns
    selected_columns = ["name", "now_cost", "total_points", "form", "minutes", "goals_scored", 
                        "assists", "clean_sheets", "xG", "xA"]
    players = players[[col for col in selected_columns if col in players.columns]]

    # Convert DataFrame to dictionary for MongoDB
    players_dict = players.to_dict(orient="records")

    # Insert data into MongoDB
    db.players.delete_many({})  # Clear existing data
    db.players.insert_many(players_dict)

    print(f"✅ {len(players_dict)} players inserted into MongoDB!")

def get_fixtures():
    """Fetch fixture data from FPL API and store it in MongoDB."""
    response = requests.get(FIXTURES_API_URL)

    if response.status_code == 200:
        fixtures = response.json()

        # Save raw JSON (optional)
        with open("fixtures.json", "w") as f:
            json.dump(fixtures, f, indent=4)

        print("✅ Fixtures fetched successfully!")

        # Insert into MongoDB
        db.fixtures.delete_many({})  # Clear existing fixtures
        db.fixtures.insert_many(fixtures)

        print(f"✅ {len(fixtures)} fixtures inserted into MongoDB!")
    else:
        print("❌ Failed to fetch fixtures data")

if __name__ == "__main__":
    get_fpl_data()
    get_fixtures()
