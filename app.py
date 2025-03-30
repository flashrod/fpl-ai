from fastapi import FastAPI
import pandas as pd
import requests

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API is running!"}

@app.get("/captain")
def get_captain():
    try:
        # Load predictions & fixtures
        df = pd.read_csv("predictions.csv")
        df = df.rename(columns={"player": "name"})  # Rename 'player' to 'name'



        fixtures_df = pd.read_csv("predicted_players.csv")  # This contains 'team_a'

        # Merge by name
        df = df.merge(fixtures_df[["name", "team_a"]], on="name", how="left")

        # Debugging: Check if merge worked
        if "team_a" not in df.columns:
            return {"error": "❌ 'team_a' column is missing after merging!"}

        # Opponent defense data (update this with actual team IDs and values)
        opponent_defense = {1: 15, 2: 10}  

        # Map opponent defense values
        df["opponent_defense"] = df["team_a"].map(opponent_defense)

        # Handle missing opponent defense values
        df["opponent_defense"] = df["opponent_defense"].fillna(10)  # Default to 10 if missing

        # Calculate captain score
        df["captain_score"] = df["predicted_points"] - (df["opponent_defense"] / 10)

        # Handle NaN values before selecting the best captain
        df.fillna(0, inplace=True)  

        # Select best captain
        best_captain = df.nlargest(1, "captain_score")

        if best_captain.empty:
            return {"error": "❌ No valid captain found!"}

        return {
            "captain": best_captain.iloc[0]["name"],
            "predicted_points": best_captain.iloc[0]["predicted_points"],
            "next_opponent": best_captain.iloc[0]["team_a"],
            "opponent_defensive_strength": best_captain.iloc[0]["opponent_defense"]
        }

    except Exception as e:
        return {"error": f"❌ Captain selection failed: {str(e)}"}
    


@app.get("/debug_captain")
def debug_captain():
    try:
        df = pd.read_csv("predictions.csv")
        df = df.rename(columns={"player": "name"})  

        fixtures_df = pd.read_csv("predicted_players.csv")  

        # Check if Salah exists in both DataFrames
        salah_pred = df[df["name"].str.contains("Salah", case=False, na=False)]
        salah_fixtures = fixtures_df[fixtures_df["name"].str.contains("Salah", case=False, na=False)]

        return {
            "salah_in_predictions": salah_pred.to_dict(orient="records"),
            "salah_in_fixtures": salah_fixtures.to_dict(orient="records"),
        }

    except Exception as e:
        return {"error": f"❌ Debugging failed: {str(e)}"}


import json

@app.get("/transfers")
def get_transfers():
    try:
        # Load player predictions
        df = pd.read_csv("predictions.csv")
        df = df.rename(columns={"player": "name"})  # Ensure consistent naming

        # Load fixture data from JSON
        with open("fixtures.json", "r") as f:
            fixtures_data = json.load(f)

        # Ensure required columns exist
        if "name" not in df.columns or "predicted_points" not in df.columns:
            return {"error": "❌ Missing required columns in predictions.csv!"}

        # Opponent defensive strength mapping (update with real values)
        opponent_defense = {1: 15, 2: 10, 3: 12, 4: 14, 5: 11}  # Example values

        # Extract next 5 fixtures for each player
        fixture_difficulties = {}
        for fixture in fixtures_data:  # Assuming it's a list of match fixtures
            player_name = fixture.get("player")  # Adjust key names as needed
            opponent_team = fixture.get("team_a")  # Adjust key names as needed
            if player_name and opponent_team:
                fixture_difficulties.setdefault(player_name, []).append(opponent_defense.get(opponent_team, 10))

        # Calculate average fixture difficulty for each player
        df["fixture_difficulty"] = df["name"].map(lambda x: sum(fixture_difficulties.get(x, [10])) / 5)

        # Adjust predicted points based on fixture difficulty
        df["adjusted_score"] = df["predicted_points"] - (df["fixture_difficulty"] / 5)

        # Get top 5 recommended transfers
        best_transfers = df.nlargest(5, "adjusted_score")[["name", "predicted_points", "fixture_difficulty", "adjusted_score"]]

        return best_transfers.to_dict(orient="records")

    except Exception as e:
        return {"error": f"❌ Transfers endpoint failed: {str(e)}"}







@app.get("/injuries")
def get_injuries():
    response = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/")
    if response.status_code != 200:
        return {"error": "Failed to fetch data from FPL API"}

    data = response.json()
    injured_players = [
        {
            "player": f"{p['first_name']} {p['second_name']}",
            "team": p["team"],
            "status": p["status"]
        }
        for p in data["elements"] if p["status"] not in ["a", "u"]
    ]

    return {"injuries": injured_players}





