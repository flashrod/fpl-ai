import { useState, useEffect } from "react";
import { getTransfers } from "../api";

function Transfers() {
    const [transfers, setTransfers] = useState([]);

    useEffect(() => {
        getTransfers().then(setTransfers);
    }, []);

    return (
        <div className="p-4 bg-green-500 text-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Best Transfers</h2>
            <ul>
                {transfers.map((player, index) => (
                    <li key={index}>
                        {player.name} - {player.predicted_points} points
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Transfers;
