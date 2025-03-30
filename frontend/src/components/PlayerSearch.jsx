import { useState, useEffect } from "react";
import { getPlayers } from "../api";

function PlayerSearch() {
    const [players, setPlayers] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getPlayers().then(setPlayers);
    }, []);

    const filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 bg-gray-700 text-white rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold">Search Players</h2>
            <input
                type="text"
                placeholder="Search by name..."
                className="w-full p-2 mt-2 text-black rounded"
                onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="mt-2">
                {filteredPlayers.map((player, index) => (
                    <li key={index} className="mt-1">{player.name} - {player.predicted_points} pts</li>
                ))}
            </ul>
        </div>
    );
}

export default PlayerSearch;
