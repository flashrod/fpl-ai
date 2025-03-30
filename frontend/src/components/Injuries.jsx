import { useState, useEffect } from "react";
import { getInjuries } from "../api";

function Injuries() {
    const [injuries, setInjuries] = useState([]);

    useEffect(() => {
        getInjuries().then((data) => setInjuries(data.injuries));
    }, []);

    return (
        <div className="p-4 bg-red-500 text-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Injuries</h2>
            <ul>
                {injuries.map((player, index) => (
                    <li key={index}>
                        {player.player} - {player.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Injuries;
