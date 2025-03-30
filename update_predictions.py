import pandas as pd

# Load players.csv
players_df = pd.read_csv("players.csv")
players_df["full_name"] = players_df["first_name"] + " " + players_df["second_name"]

# Load predictions.csv
predictions_df = pd.read_csv("predictions.csv")

# Merge to add player ID
merged_df = predictions_df.merge(players_df[["id", "full_name", "team"]], 
                                 left_on="player", right_on="full_name", how="left")

# Save updated predictions.csv
merged_df.drop(columns=["full_name"], inplace=True)
merged_df.to_csv("predictions_updated.csv", index=False)
