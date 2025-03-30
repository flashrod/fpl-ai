const API_URL = "http://127.0.0.1:8000"; // Change if backend is hosted

export async function getCaptain() {
    try {
        const response = await fetch(`${API_URL}/captain`);
        if (!response.ok) throw new Error("Failed to fetch captain choice");
        return response.json();
    } catch (error) {
        console.error("❌ Error fetching captain:", error.message);
        throw error;
    }
}


export async function getPlayers() {
    const res = await fetch(`${API_URL}/players`);
    return await res.json();
}

export const getComparison = async (player1, player2) => {
    const res = await fetch(`${API_URL}/compare?player1=${player1}&player2=${player2}`);
    return res.json();
};

export async function getTransfers() {
    const response = await fetch(`${API_URL}/transfers`);
    return response.json();
}

export async function getInjuries() {
    const response = await fetch(`${API_URL}/injuries`);
    return response.json();
}

// ✅ New function to submit the starting 11 and get team rating
export async function getTeamRating(team) {
    try {
        const response = await fetch(`${API_URL}/team_rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(team), // ✅ Send the array directly
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch team rating");

        return data;
    } catch (error) {
        console.error("❌ Error fetching team rating:", error);
        throw new Error(error.message || "An error occurred while fetching team rating");
    }
}

