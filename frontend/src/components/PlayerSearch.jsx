import { useState, useEffect } from "react";

function PlayerSearch() {
    const [players, setPlayers] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/players")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setPlayers(data); // Ensure it's an array
                } else {
                    setPlayers([]); // Prevent undefined issues
                }
            })
            .catch(() => setPlayers([])); // Handle API failure
    }, []);

    const filteredPlayers = players.filter(player =>
        player.full_name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 bg-gray-700 text-white rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold">Search Players</h2>
            <input
                type="text"
                placeholder="Search by name..."
                className="w-full p-2 mt-2 text-black rounded"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
            />

            {/* Only show results if there's a search query */}
            {query.length > 0 && (
                <ul className="mt-2">
                    {filteredPlayers.length > 0 ? (
                        filteredPlayers.map((player, index) => (
                            <li key={index} className="mt-1">
                                {player.full_name} - {player.total_points} pts
                            </li>
                        ))
                    ) : (
                        <li className="mt-1 text-gray-400">No players found</li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default PlayerSearch;
