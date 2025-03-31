import pymongo
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = pymongo.MongoClient(MONGO_URI)
db = client["fpl_db"]
players_collection = db["players"]

player = players_collection.find_one({}, {"_id": 0})
print(player)
