import pymongo
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = pymongo.MongoClient(MONGO_URI)
db = client["fpl_db"]
players_collection = db["players"]
fixtures_collection = db["fixtures"]
teams_collection = db["teams"]

# Load teams and map team_id to team name
teams = {team["id"]: team["name"] for team in teams_collection.find({}, {"_id": 0, "id": 1, "name": 1})}

# Load fixtures
fixtures = list(fixtures_collection.find({}, {"_id": 0, "team_h": 1, "team_a": 1}))

# Create a mapping of next fixtures for each team
next_fixtures = {}
for fixture in fixtures:
    if fixture["team_h"] not in next_fixtures:
        next_fixtures[fixture["team_h"]] = fixture["team_a"]
    if fixture["team_a"] not in next_fixtures:
        next_fixtures[fixture["team_a"]] = fixture["team_h"]

# Fetch first 5 players and add their next fixture
players = list(players_collection.find({}, {"_id": 0}).limit(5))

for player in players:
    team_id = player["team_id"]
    player["next_opponent"] = teams.get(next_fixtures.get(team_id), "Unknown")  # Add next opponent
    print(player)  # Print player with updated fixture info
