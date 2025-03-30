import pymongo
import json

client = pymongo.MongoClient("mongodb+srv://flashsweats:rachillesheel123@cluster0.5s4mx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
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
