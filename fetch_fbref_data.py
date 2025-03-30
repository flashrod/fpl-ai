import requests
import json

FPL_API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"

def get_fpl_player_data():
    response = requests.get(FPL_API_URL)

    if response.status_code != 200:
        print(f"❌ Failed to fetch data: {response.status_code}")
        return None

    data = response.json()

    # Extract only relevant player data
    players = data["elements"]
    player_data = [
        {
            "name": f"{p['first_name']} {p['second_name']}",
            "team": p["team"],
            "goals_scored": p["goals_scored"],
            "assists": p["assists"],
            "expected_goals": p["expected_goals"],
            "expected_assists": p["expected_assists"],
            "total_points": p["total_points"],
            "selected_by_percent": p["selected_by_percent"],
            "now_cost": p["now_cost"] / 10,  # Convert to real value (e.g. 120 = £12.0m)
        }
        for p in players
    ]

    return player_data

if __name__ == "__main__":
    data = get_fpl_player_data()

    if data:
        print("✅ FPL Player Data Fetched!")
        print(json.dumps(data[:5], indent=4))  # Show top 5 players
