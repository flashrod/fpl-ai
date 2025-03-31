from fastapi import FastAPI, Query, HTTPException
import pandas as pd
import json
import os
import requests
import numpy as np
import subprocess
from typing import List
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import pymongo
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
load_dotenv()


app = FastAPI()
MONGO_URI = os.getenv("MONGO_URI")
client = pymongo.MongoClient(MONGO_URI)
client = pymongo.MongoClient("mongodb+srv://flashsweats:rachillesheel123@cluster0.5s4mx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["fpl_db"]
players_collection = db["players"]
fixtures_collection = db["fixtures"]

def update_fpl_data():
    try:
        print("🔄 Updating FPL data...")
        
        # Run existing scripts to fetch data
        subprocess.run(["python", "fetch_fpl_data.py"])
        subprocess.run(["python", "fetch_injuries.py"])
        subprocess.run(["python", "check_fixtures.py"])
        subprocess.run(["python", "process_fpl_data.py"])  # Process and store in MongoDB

        print("✅ FPL data updated successfully!")
    except Exception as e:
        print(f"❌ Error updating FPL data: {e}")

# Scheduler to run updates every hour
scheduler = BackgroundScheduler()
scheduler.add_job(update_fpl_data, "interval", hours=1)
scheduler.start()



# ✅ CORS Middleware - Move to the top
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.get("/")
def home():
    return {"message": "API is running!"}







# ✅ Players Endpoint with File Existence Check
@app.get("/players")
def get_players():
    if not os.path.exists("players.csv"):
        raise HTTPException(status_code=404, detail="❌ players.csv file not found!")
    
    try:
        df = pd.read_csv("players.csv")
        df["full_name"] = df["first_name"] + " " + df["second_name"]
        return df[["full_name", "team", "total_points"]].to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Failed to fetch players: {str(e)}")


# ✅ Injuries Endpoint with API Check
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


# ✅ Transfers Endpoint with File Check
@app.get("/transfers")
def get_transfers():
    if not os.path.exists("predictions.csv") or not os.path.exists("fixtures.json"):
        raise HTTPException(status_code=404, detail="❌ Required files not found!")

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
        raise HTTPException(status_code=500, detail=f"❌ Transfers endpoint failed: {str(e)}")


# ✅ Team Builder with Valid Formation Check
@app.get("/team_builder")
def get_best_xi():
    if not os.path.exists("players.csv") or not os.path.exists("fpl_players.csv"):
        raise HTTPException(status_code=404, detail="❌ Required files not found!")

    try:
        df_players = pd.read_csv("players.csv")
        df_fpl_players = pd.read_csv("fpl_players.csv")

        df = df_players.merge(df_fpl_players, on="id", how="left")
        rename_map = {"first_name_x": "first_name", "second_name_x": "second_name",
                      "total_points_x": "total_points", "minutes_x": "minutes", "team_x": "team"}
        df.rename(columns=rename_map, inplace=True)

        df["full_name"] = df["first_name"] + " " + df["second_name"]
        df = df[df["minutes"] > 0]
        df["points_per_game"] = df["total_points"] / (df["minutes"] / 90)
        df["points_per_game"].replace([np.inf, -np.inf], np.nan, inplace=True)
        df["points_per_game"].fillna(0, inplace=True)

        position_map = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"}
        df["position"] = df["element_type"].map(position_map)

        formation = {"GK": 1, "DEF": 3, "MID": 4, "FWD": 3}
        best_xi = []

        for pos, count in formation.items():
            pos_players = df[df["position"] == pos].nlargest(count, "points_per_game")
            best_xi.extend(pos_players.to_dict(orient="records"))

        best_xi = sorted(best_xi, key=lambda x: x["points_per_game"], reverse=True)
        if best_xi:
            best_xi[0]["captain"] = True
        if len(best_xi) > 1:
            best_xi[1]["vice_captain"] = True

        return {"best_xi": best_xi}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Team Builder failed: {str(e)}")


# ✅ Team Rating with Improved Calculation
class TeamInput(BaseModel):
    team: List[str]

@app.post("/team_rating")
def team_rating(team_input: TeamInput):
    if not os.path.exists("players.csv") or not os.path.exists("fixtures.csv"):
        raise HTTPException(status_code=404, detail="❌ Required files not found!")

    try:
        df_players = pd.read_csv("players.csv")
        df_fixtures = pd.read_csv("fixtures.csv")

        df_players["full_name"] = df_players["first_name"] + " " + df_players["second_name"]
        team = df_players[df_players["full_name"].isin(team_input.team)]
        if team.empty:
            raise HTTPException(status_code=400, detail="❌ No matching players found!")

        team["ppg"] = team["total_points"] / (team["minutes"] / 90)
        team["ppg"].replace([np.inf, -np.inf], 0, inplace=True)
        avg_ppg = team["ppg"].mean()

        fixture_difficulty = df_fixtures[df_fixtures["home_team"].isin(team["team"]) | df_fixtures["away_team"].isin(team["team"])]
        avg_fixture_difficulty = fixture_difficulty["difficulty"].mean()

        rating = (team["total_points"].sum() / 10) + (avg_ppg * 10) - (avg_fixture_difficulty * 2)
        return {"team_rating": round(rating, 2), "average_ppg": round(avg_ppg, 2), "average_fixture_difficulty": round(avg_fixture_difficulty, 2)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Team Rating failed: {str(e)}")





app = FastAPI()

@app.get("/captain")
def get_captain():
    try:
        # ✅ Load the fixed CSV with team_a already merged
        df = pd.read_csv("merged_output.csv")

        if "team_a" not in df.columns:
            return {"error": "❌ 'team_a' column is missing from merged_output.csv!"}

        # ✅ Fill missing opponent values with a default (if any are still NaN)
        df["team_a"].fillna(-1, inplace=True)  # Use -1 to indicate unknown opponent

        # ✅ Define opponent defense strength (change as needed)
        opponent_defense = {1: 15, 2: 10}  # Example mapping
        df["opponent_defense"] = df["team_a"].map(opponent_defense).fillna(10)

        # ✅ Calculate captain score
        df["captain_score"] = df["predicted_points"] - (df["opponent_defense"] / 10)
        df.fillna(0, inplace=True)

        # ✅ Select the best captain
        best_captain = df.nlargest(1, "captain_score")

        if best_captain.empty:
            return {"error": "❌ No valid captain found!"}

        return {
            "captain": best_captain.iloc[0]["name"],
            "predicted_points": best_captain.iloc[0]["predicted_points"],
            "next_opponent": int(best_captain.iloc[0]["team_a"]),  # Ensure it's an integer
            "opponent_defensive_strength": best_captain.iloc[0]["opponent_defense"]
        }

    except Exception as e:
        return {"error": f"❌ Captain selection failed: {str(e)}"}
