import pandas as pd
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Load processed data
df = pd.read_csv("training_data.csv")

# Select features for training
features = ["now_cost", "total_points", "form", "minutes", "goals_scored", "assists", "clean_sheets", "xG", "xA"]
X = df[features]
y = df["total_points"]  # Predicting total points

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
with open("fpl_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained and saved successfully!")
