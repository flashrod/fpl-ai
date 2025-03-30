import { useState } from "react";

function PlayerComparison() {
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [comparison, setComparison] = useState(null);
    const [error, setError] = useState("");

    const fetchComparison = () => {
        if (!player1 || !player2) {
            setError("❌ Please enter both player names!");
            return;
        }

        fetch(`http://127.0.0.1:8000/compare?player1=${player1}&player2=${player2}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                    setComparison(null);
                } else {
                    setComparison(data.players);
                    setError("");
                }
            })
            .catch(() => setError("❌ Failed to fetch comparison data!"));
    };

    return (
        <div className="p-4 bg-gray-700 text-white rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold">Compare Players</h2>

            <input
                type="text"
                placeholder="Enter Player 1"
                className="w-full p-2 mt-2 text-black rounded"
                onChange={(e) => setPlayer1(e.target.value)}
                value={player1}
            />
            
            <input
                type="text"
                placeholder="Enter Player 2"
                className="w-full p-2 mt-2 text-black rounded"
                onChange={(e) => setPlayer2(e.target.value)}
                value={player2}
            />

            <button
                className="mt-3 bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
                onClick={fetchComparison}
            >
                Compare
            </button>

            {error && <p className="mt-2 text-red-400">{error}</p>}

            {comparison && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Comparison Results</h3>
                    {comparison.map((player, index) => (
                        <div key={index} className="mt-2 p-2 bg-gray-800 rounded">
                            <p><strong>{player.full_name}</strong></p>
                            <p>Predicted Points: <span className="text-green-400">{player.predicted_points}</span></p>
                            <p>Fixture Difficulty: <span className="text-yellow-400">{player.fixture_difficulty.toFixed(2)}</span></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PlayerComparison;
