import pymongo
import json
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = pymongo.MongoClient(MONGO_URI)
db = client["fpl_db"]
db = client["fpl_db"]
players_collection = db["players"]

def store_players():
    with open("fpl_data.json", "r") as f:
        data = json.load(f)

    players = data["elements"]
    
    players_collection.insert_many(players)
    print("✅ Player data stored in MongoDB!")

if __name__ == "__main__":
    store_players()
