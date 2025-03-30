import pandas as pd


fixtures = pd.read_json("fixtures.json")
print(fixtures.head())  # Check if "team_a" exists


# Print first few rows
print(fixtures.head())