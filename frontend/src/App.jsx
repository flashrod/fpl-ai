import Captain from "./components/Captain";
import Transfers from "./components/Transfers";
import Injuries from "./components/Injuries";
import PlayerSearch from "./components/PlayerSearch";
import PlayerComparison from "./components/PlayerComparison";
import TeamRating from "./components/TeamRating";


function App() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-4">FPL AI Assistant</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                <PlayerSearch />
                <Transfers />
                <Captain />
                <Injuries />
                <TeamRating />
                
            </div>
        </div>
    );
}

export default App;
