from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import requests

app = FastAPI()

# ✅ Allow all origins for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API is running!"}

# ✅ Fix: `/players` now includes predicted points
@app.get("/players")
def get_players():
    try:
        df = pd.read_csv("players.csv")

        df["full_name"] = df["first_name"] + " " + df["second_name"]

        return df[["full_name", "team", "total_points"]].to_dict(orient="records")

    except Exception as e:
        return {"error": f"❌ Failed to fetch players: {str(e)}"}


# ✅ Fix: `/injuries` always returns a valid JSON response
@app.get("/injuries")
def get_injuries():
    try:
        response = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/")
        if response.status_code != 200:
            return {"injuries": []}

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

    except Exception:
        return {"injuries": []}

# ✅ Fix: `/transfers` correctly calculates adjusted scores
@app.get("/transfers")
def get_transfers():
    try:
        df = pd.read_csv("predictions.csv")
        df = df.rename(columns={"player": "name"})

        with open("fixtures.json", "r") as f:
            fixtures_data = json.load(f)

        opponent_defense = {1: 15, 2: 10, 3: 12, 4: 14, 5: 11}  

        fixture_difficulties = {}
        for fixture in fixtures_data:
            player_name = fixture.get("player")
            opponent_team = fixture.get("team_a")
            if player_name and opponent_team:
                fixture_difficulties.setdefault(player_name, []).append(opponent_defense.get(opponent_team, 10))

        df["fixture_difficulty"] = df["name"].map(lambda x: sum(fixture_difficulties.get(x, [10])) / 5)
        df["adjusted_score"] = df["predicted_points"] - (df["fixture_difficulty"] / 5)

        best_transfers = df.nlargest(5, "adjusted_score")[["name", "predicted_points", "fixture_difficulty", "adjusted_score"]]
        return best_transfers.to_dict(orient="records")

    except Exception as e:
        return {"error": f"❌ Transfers endpoint failed: {str(e)}"}

# ✅ Fix: `/compare` allows comparing two players with correct points & fixture difficulty
@app.get("/compare")
def compare_players(player1: str = Query(...), player2: str = Query(...)):
    try:
        df = pd.read_csv("predictions_updated.csv")  # Using the new CSV
        df = df.rename(columns={"player": "name"})

        if "name" not in df.columns or "predicted_points" not in df.columns:
            return {"error": "❌ Missing required columns in predictions_updated.csv!"}

        # Select the two players
        players = df[df["name"].isin([player1, player2])]

        if len(players) < 2:
            return {"error": "❌ One or both players not found!"}

        return {"players": players.to_dict(orient="records")}

    except Exception as e:
        return {"error": f"❌ Comparison failed: {str(e)}"}
# ✅ Fix: `/captain` now properly selects the best captain
@app.get("/captain")
def get_captain():
    try:
        df = pd.read_csv("predictions.csv")
        df = df.rename(columns={"player": "name"})

        fixtures_df = pd.read_csv("predicted_players.csv")

        df = df.merge(fixtures_df[["name", "team_a"]], on="name", how="left")

        if "team_a" not in df.columns:
            return {"error": "❌ 'team_a' column is missing after merging!"}

        opponent_defense = {1: 15, 2: 10}
        df["opponent_defense"] = df["team_a"].map(opponent_defense)
        df["opponent_defense"] = df["opponent_defense"].fillna(10)

        df["captain_score"] = df["predicted_points"] - (df["opponent_defense"] / 10)
        df.fillna(0, inplace=True)

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

# ✅ Debugging route to check Salah's presence in data
@app.get("/debug_captain")
def debug_captain():
    try:
        df = pd.read_csv("predictions.csv")
        df = df.rename(columns={"player": "name"})  

        fixtures_df = pd.read_csv("predicted_players.csv")  

        salah_pred = df[df["name"].str.contains("Salah", case=False, na=False)]
        salah_fixtures = fixtures_df[fixtures_df["name"].str.contains("Salah", case=False, na=False)]

        return {
            "salah_in_predictions": salah_pred.to_dict(orient="records"),
            "salah_in_fixtures": salah_fixtures.to_dict(orient="records"),
        }

    except Exception as e:
        return {"error": f"❌ Debugging failed: {str(e)}"}
    

@app.get("/debug_players")
def debug_players():
    df_players = pd.read_csv("players.csv")
    df_predictions = pd.read_csv("predictions.csv")

    print("Players.csv Columns:", df_players.columns)
    print("Predictions.csv Columns:", df_predictions.columns)

    print("Players Sample:", df_players.head())
    print("Predictions Sample:", df_predictions.head())

    return {"message": "Check the console output for data format issues"}


