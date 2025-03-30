import pandas as pd

# Load processed player data
df = pd.read_csv("training_data.csv")

# Load fixture data
fixtures_df = pd.read_json("fixtures.json")

# Ensure 'team' column exists in training data
if "team" not in df.columns:
    raise KeyError("❌ 'team' column is missing in training_data.csv")

# Ensure 'team_h' and 'team_a' exist in fixtures
if "team_h" not in fixtures_df.columns or "team_a" not in fixtures_df.columns:
    raise KeyError("❌ 'team_h' or 'team_a' column is missing in fixtures.json")

# Merge fixture data to get next opponent for each team
df = df.merge(fixtures_df[["event", "team_h", "team_a"]], left_on="team", right_on="team_h", how="left")

# Drop extra columns and rename
df = df.drop(columns=["team_h"])
df.rename(columns={"team_a": "next_opponent"}, inplace=True)

# Ensure 'next_opponent' is properly assigned
if df["next_opponent"].isnull().all():
    raise ValueError("❌ All 'next_opponent' values are missing. Check fixture mapping.")

# Add predicted points (Replace with your actual model prediction)
df["predicted_points"] = df["total_points"] * 0.8 + df["form"].astype(float) * 2

# Save predictions
df.to_csv("predictions.csv", index=False)
print("✅ Predictions saved successfully!")
