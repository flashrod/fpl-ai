import requests
import pandas as pd

# FPL API Endpoint
FPL_API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"
TRAINING_FILE = "training_data.csv"

def fetch_fpl_data():
    """Fetch live FPL data from the official API."""
    response = requests.get(FPL_API_URL)
    if response.status_code == 200:
        data = response.json()
        return data["elements"]  # Player data
    else:
        print("❌ Failed to fetch FPL data!")
        return None

def process_fpl_data(players):
    """Extract relevant player data and save it as a CSV."""
    df = pd.DataFrame(players)

    # Select only the columns we need
    df = df[[
        "web_name", "now_cost", "total_points", "form", "minutes", 
        "goals_scored", "assists", "clean_sheets", "expected_goals", "expected_assists"
    ]]

    # Rename columns for clarity
    df.rename(columns={
        "web_name": "player",
        "expected_goals": "xG",
        "expected_assists": "xA"
    }, inplace=True)

    # Convert cost from integer to actual price (e.g., 100 = 10.0M)
    df["now_cost"] = df["now_cost"] / 10

    # Save to CSV
    df.to_csv(TRAINING_FILE, index=False)
    print(f"✅ Updated {TRAINING_FILE} with live FPL data!")

if __name__ == "__main__":
    players = fetch_fpl_data()
    if players:
        process_fpl_data(players)
