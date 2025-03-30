import json
import pandas as pd

def load_fpl_data():
    with open("fpl_data.json", "r") as f:
        data = json.load(f)
    return data

def process_players():
    data = load_fpl_data()
    players = data["elements"]  # List of players
    df = pd.DataFrame(players)

    # Select relevant columns
    df = df[["id", "first_name", "second_name", "team", "now_cost", "total_points", 
             "form", "minutes", "goals_scored", "assists", "clean_sheets", "selected_by_percent"]]
    
    df["now_cost"] = df["now_cost"] / 10  # Convert cost from 1000s to actual price
    df.sort_values(by="total_points", ascending=False, inplace=True)

    df.to_csv("players.csv", index=False)
    print("✅ Player data saved!")

if __name__ == "__main__":
    process_players()
