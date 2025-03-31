import requests
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = pymongo.MongoClient(MONGO_URI)
db = client["fpl_db"]
players_collection = db["players"]
teams_collection = db["teams"]

# Fetch FPL data
FPL_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"
response = requests.get(FPL_URL).json()

players_data = response["elements"]
teams_data = response["teams"]

# Store teams in MongoDB
teams_collection.delete_many({})
teams_collection.insert_many(teams_data)

# Create a dictionary to map team IDs to team names
team_id_to_name = {team["id"]: team["name"] for team in teams_data}

# Process players
players_list = []
for player in players_data:
    players_list.append({
        "name": player["web_name"],
        "team_id": player["team"],  # ✅ Correctly store team ID
        "team": team_id_to_name.get(player["team"], "Unknown"),  # ✅ Map team ID to name
        "now_cost": player["now_cost"],
        "total_points": player["total_points"],
        "form": player["form"],
        "minutes": player["minutes"],
        "goals_scored": player["goals_scored"],
        "assists": player["assists"],
        "clean_sheets": player["clean_sheets"],
        "xG": player["expected_goals_per_90"],
        "xA": player["expected_assists_per_90"]
    })

# Store players in MongoDB
players_collection.delete_many({})
players_collection.insert_many(players_list)

print("✅ Player data saved successfully!")
