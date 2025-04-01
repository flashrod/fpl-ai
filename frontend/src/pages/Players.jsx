// src/pages/Players.jsx
import { useState, useEffect } from 'react';
import { getPlayers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PlayerTable from '../components/PlayerTable';
import PlayerCard from '../components/PlayerCard';
import { FaSearch, FaFilter, FaThList, FaTh } from 'react-icons/fa';

const Players = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayers();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Get unique team names for filtering
  const teamNames = [...new Set(players.map(player => player.team_name))].sort();
  
  // Filter players based on search term and filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !positionFilter || player.position === positionFilter;
    const matchesTeam = !teamFilter || player.team_name === teamFilter;
    
    return matchesSearch && matchesPosition && matchesTeam;
  });
  
  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };
  
  const closePlayerDetails = () => {
    setSelectedPlayer(null);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Players</h1>
      
      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpl-purple"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-full md:w-40">
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpl-purple"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="">All Positions</option>
                <option value="GK">Goalkeeper</option>
                <option value="DEF">Defender</option>
                <option value="MID">Midfielder</option>
                <option value="FWD">Forward</option>
              </select>
            </div>
            
            <div className="w-full md:w-40">
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpl-purple"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              >
                <option value="">All Teams</option>
                {teamNames.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <button
                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-fpl-purple text-white' : 'bg-gray-200'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <FaThList />
              </button>
              <button
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-fpl-purple text-white' : 'bg-gray-200'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <FaTh />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredPlayers.length} of {players.length} players
        </p>
      </div>
      
      {/* Players list */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <PlayerTable players={filteredPlayers} onPlayerSelect={handlePlayerSelect} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => (
            <div key={player.name} onClick={() => handlePlayerSelect(player)} className="cursor-pointer">
              <PlayerCard player={player} />
            </div>
          ))}
        </div>
      )}
      
      {/* Player details modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
                <button
                  onClick={closePlayerDetails}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Player Info</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Team:</span> {selectedPlayer.team_name}</p>
                    <p><span className="font-medium">Position:</span> {selectedPlayer.position}</p>
                    <p><span className="font-medium">Value:</span> £{(selectedPlayer.value / 10).toFixed(1)}m</p>
                    <p><span className="font-medium">Selected by:</span> {selectedPlayer.selected_by_percent}%</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Stats</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Points:</span> {selectedPlayer.total_points}</p>
                    <p><span className="font-medium">Form:</span> {selectedPlayer.form}</p>
                    <p><span className="font-medium">Goals:</span> {selectedPlayer.goals_scored}</p>
                    <p><span className="font-medium">Assists:</span> {selectedPlayer.assists}</p>
                    <p><span className="font-medium">Clean Sheets:</span> {selectedPlayer.clean_sheets}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Upcoming Fixtures</h3>
                <p>Next: {typeof selectedPlayer.next_opponent === 'string' ? 
                  selectedPlayer.next_opponent : `Team ${selectedPlayer.next_opponent}`}</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePlayerDetails}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;