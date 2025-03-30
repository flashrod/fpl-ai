import { useState, useEffect } from "react";
import { getInjuries } from "../api";

// Map of team IDs to actual club names (update if needed)
const teamNames = {
    1: "Arsenal",
    2: "Aston Villa",
    3: "Bournemouth",
    4: "Brentford",
    5: "Brighton",
    6: "Burnley",
    7: "Chelsea",
    8: "Crystal Palace",
    9: "Everton",
    10: "Fulham",
    11: "Liverpool",
    12: "Luton",
    13: "Man City",
    14: "Man United",
    15: "Newcastle",
    16: "Nottingham Forest",
    17: "Sheffield United",
    18: "Tottenham",
    19: "West Ham",
    20: "Wolves"
};

function Injuries() {
    const [injuries, setInjuries] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getInjuries().then(data => {
            // Convert team IDs to team names
            const updatedInjuries = data.injuries.map(player => ({
                ...player,
                team: teamNames[player.team] || "Unknown"
            }));
            setInjuries(updatedInjuries);
        });
    }, []);

    // Filter injuries by club name
    const filteredInjuries = injuries.filter(player =>
        player.team.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 bg-red-600 text-white rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold">Injured Players</h2>
            <input
                type="text"
                placeholder="Search by club..."
                className="w-full p-2 mt-2 text-black rounded"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
            />

            {query.length > 0 && (
                <ul className="mt-2">
                    {filteredInjuries.length > 0 ? (
                        filteredInjuries.map((player, index) => (
                            <li key={index} className="mt-1">
                                {player.player} - {player.status} ({player.team})
                            </li>
                        ))
                    ) : (
                        <li className="mt-1 text-gray-300">No injuries found for this club</li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default Injuries;
