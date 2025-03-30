import pandas as pd

df = pd.read_csv("merged_output.csv")
print(df[["name", "team_a"]].head(20))  # Show first 20 rows
