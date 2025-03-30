const API_URL = "http://127.0.0.1:8000"; // Change if backend is hosted

export async function getCaptain() {
    const response = await fetch(`${API_URL}/captain`);
    return response.json();
}

export async function getPlayers() {
    const res = await fetch("http://localhost:8000/players");
    return await res.json();
}


export async function getTransfers() {
    const response = await fetch(`${API_URL}/transfers`);
    return response.json();
}

export async function getInjuries() {
    const response = await fetch(`${API_URL}/injuries`);
    return response.json();
}
