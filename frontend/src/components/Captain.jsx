import { useState, useEffect } from "react";
import { getCaptain } from "../api";

function Captain() {
    const [captain, setCaptain] = useState(null);

    useEffect(() => {
        getCaptain().then(setCaptain);
    }, []);

    return (
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Best Captain</h2>
            {captain ? (
                <p className="text-lg">
                    <strong>{captain.captain}</strong> ({captain.predicted_points} points)
                </p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default Captain;
