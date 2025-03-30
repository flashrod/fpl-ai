import { useState, useEffect } from "react";
import { getTransfers } from "../api";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Transfers() {
    const [transfers, setTransfers] = useState([]);

    useEffect(() => {
        getTransfers().then(setTransfers);
    }, []);

    const data = {
        labels: transfers.map(player => player.name),
        datasets: [
            {
                label: "Predicted Points",
                data: transfers.map(player => player.predicted_points),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
            {
                label: "Fixture Difficulty",
                data: transfers.map(player => player.fixture_difficulty),
                backgroundColor: "rgba(255, 99, 132, 0.6)",
            }
        ]
    };

    return (
        <div className="p-4 bg-green-500 text-white rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold">Best Transfers</h2>
            {transfers.length > 0 ? <Bar key={JSON.stringify(data)} data={data} /> : <p>Loading...</p>}
        </div>
    );
}

export default Transfers;
