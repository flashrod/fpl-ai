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
import pymongo
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
MONGO_URI = os.getenv("MONGO_URI")
client = pymongo.MongoClient(MONGO_URI)
db = client["fpl_db"]
players_collection = db["players"]
fixtures_collection = db["fixtures"]

def get_next_opponent(team_id):
    fixture = fixtures_collection.find_one({"team_a": team_id}) or fixtures_collection.find_one({"team_h": team_id})
    if fixture:
        return fixture["team_h"] if fixture["team_a"] == team_id else fixture["team_a"]
    return "Unknown"

def update_fpl_data():
    try:
        print("🔄 Updating FPL data...")
        subprocess.run(["python", "fetch_fpl_data.py"])
        subprocess.run(["python", "fetch_injuries.py"])
        subprocess.run(["python", "check_fixtures.py"])
        subprocess.run(["python", "process_fpl_data.py"])
        
        for player in players_collection.find():
            next_opponent = get_next_opponent(player["team_id"])
            players_collection.update_one(
                {"_id": player["_id"]}, {"$set": {"next_opponent": next_opponent}}
            )
        print("✅ Next opponent updated for all players!")
    except Exception as e:
        print(f"❌ Error updating FPL data: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(update_fpl_data, "interval", hours=24)
scheduler.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API is running!"}

@app.get("/players")
def get_players():
    players = list(players_collection.find({}, {"_id": 0}))
    return players

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

@app.get("/transfers")
def get_transfers():
    try:
        transfers = list(players_collection.find({}, {"_id": 0}))
        return transfers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Transfers endpoint failed: {str(e)}")

@app.get("/team_builder")
def get_best_xi():
    try:
        players = list(players_collection.find({}, {"_id": 0}))
        best_xi = sorted(players, key=lambda x: x["total_points"], reverse=True)[:11]
        return {"best_xi": best_xi}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Team Builder failed: {str(e)}")

class TeamInput(BaseModel):
    team: List[str]

@app.post("/team_rating")
def team_rating(team_input: TeamInput):
    try:
        players = list(players_collection.find({"name": {"$in": team_input.team}}, {"_id": 0}))
        avg_points = np.mean([p["total_points"] for p in players]) if players else 0
        return {"team_rating": round(avg_points, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Team Rating failed: {str(e)}")

@app.get("/captain")
def get_captain():
    try:
        players = list(players_collection.find({}, {"_id": 0}))
        best_captain = max(players, key=lambda x: x["total_points"], default=None)
        return best_captain if best_captain else {"error": "No valid captain found!"}
    except Exception as e:
        return {"error": f"❌ Captain selection failed: {str(e)}"}

import atexit
atexit.register(lambda: scheduler.shutdown())
