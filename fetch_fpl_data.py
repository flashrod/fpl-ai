import requests
import json
import pandas as pd

FPL_API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"
FIXTURES_API_URL = "https://fantasy.premierleague.com/api/fixtures/"

def get_fpl_data():
    response = requests.get(FPL_API_URL)
    if response.status_code == 200:
        data = response.json()
        with open("fpl_data.json", "w") as f:
            json.dump(data, f, indent=4)
        print("✅ Data saved successfully!")
        process_fpl_data(data)
    else:
        print("❌ Failed to fetch data")

def process_fpl_data(data):
    # Extract players and teams
    players = pd.DataFrame(data["elements"])
    teams = pd.DataFrame(data["teams"])[["id", "name"]]  # Keep only ID and name

    # Rename columns
    players = players.rename(columns={"team": "team_id", "expected_goals": "xG", "expected_assists": "xA"})
    
    # Merge team names
    if "id" in teams.columns and "team_id" in players.columns:
        players = players.merge(teams, left_on="team_id", right_on="id", how="left")
        players = players.drop(columns=["team_id"])  # Drop only if it exists
        if "id" in players.columns:
            players = players.drop(columns=["id"])  # Drop again if still present
    
    # Select required columns
    selected_columns = ["name", "now_cost", "total_points", "form", "minutes", "goals_scored", 
                        "assists", "clean_sheets", "xG", "xA", "name"]
    
    # Ensure all required columns exist before filtering
    players = players[[col for col in selected_columns if col in players.columns]]
    
    # Save structured data
    players.to_csv("training_data.csv", index=False)
    print("✅ Processed data saved successfully!")

def get_fixtures():
    response = requests.get(FIXTURES_API_URL)
    if response.status_code == 200:
        fixtures = response.json()
        with open("fixtures.json", "w") as f:
            json.dump(fixtures, f, indent=4)
        print("✅ Fixtures saved successfully!")
    else:
        print("❌ Failed to fetch fixtures data")

if __name__ == "__main__":
    get_fpl_data()
    get_fixtures()
