import requests

FPL_API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"

def get_injuries():
    response = requests.get(FPL_API_URL)
    if response.status_code != 200:
        return {"error": "Failed to fetch data from FPL API"}

    data = response.json()
    injured_players = [
        {
            "player": f"{p['first_name']} {p['second_name']}",
            "team": p["team"],
            "status": p["status"]
        }
        for p in data["elements"] if p["status"] not in ["a", "u"]  # Exclude available and unknown status
    ]
    
    return {"injuries": injured_players}
