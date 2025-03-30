import { useState, useEffect } from "react";
import { getInjuries } from "../api";

function Injuries() {
    const [injuries, setInjuries] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getInjuries().then(data => setInjuries(data.injuries || []));
    }, []);

    // Filter by club name
    const filteredInjuries = injuries.filter(player =>
        String(player.team).toLowerCase().includes(query.toLowerCase())
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
                                {player.player} - {player.status}
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
