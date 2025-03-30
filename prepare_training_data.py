import pymongo
import pandas as pd

client = pymongo.MongoClient("mongodb+srv://flashsweats:rachillesheel123@cluster0.5s4mx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["fpl_db"]
players_collection = db["players"]
live_stats_collection = db["live_stats"]

def get_training_data():
    players = list(players_collection.find({}, {"_id": 0}))
    live_stats = live_stats_collection.find_one({}, {"_id": 0})

    df = pd.DataFrame(players)

    # Merge with live stats
    for player in df.itertuples():
        player_id = player.id
        if player_id in live_stats:
            df.at[player.Index, "xG"] = live_stats[player_id]["xG"]
            df.at[player.Index, "xA"] = live_stats[player_id]["xA"]

    # Fill missing values
    df.fillna(0, inplace=True)

    # Save as CSV
    df.to_csv("training_data.csv", index=False)
    print("✅ Training data prepared!")

if __name__ == "__main__":
    get_training_data()
