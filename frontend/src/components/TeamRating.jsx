import { useState } from "react";

const TeamRating = ({ onSubmit }) => {
    const [team, setTeam] = useState("");
    const [rating, setRating] = useState(null);
    const [weaknesses, setWeaknesses] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/team_rating", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ team: team.split(",") }), // Assuming input is comma-separated names
            });
            const data = await response.json();

            setRating(data.rating || "N/A");
            setWeaknesses(data.weaknesses || []); // Ensure weaknesses is always an array
        } catch (error) {
            console.error("Error fetching team rating:", error);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Team Rating</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Enter player names (comma-separated)"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Get Rating
                </button>
            </form>

            {rating !== null && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Team Rating: {rating}</h3>
                    <h4 className="text-md font-semibold text-white mt-2">Weaknesses:</h4>
                    <ul className="list-disc pl-5 text-gray-300">
                        {(weaknesses || []).map((weakness, i) => (
                            <li key={i}>{weakness}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TeamRating;
