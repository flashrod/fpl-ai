// src/pages/TeamBuilder.jsx
import { useState, useEffect } from 'react';
import { getPlayers, getBestXI, submitTeamRating } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PlayerCard from '../components/PlayerCard';
import { FaUserPlus, FaStar, FaRandom, FaCheck, FaTimes } from 'react-icons/fa';

const MAX_GK = 1;
const MAX_DEF = 5;
const MAX_MID = 5;
const MAX_FWD = 3;
const MAX_TEAM_PLAYERS = 3;
const TOTAL_BUDGET = 100.0;

const TeamBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState([]);
  const [bestXI, setBestXI] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState({
    GK: 0,
    DEF: 0,
    MID: 0,
    FWD: 0
  });
  const [teamPlayerCount, setTeamPlayerCount] = useState({});
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [captainId, setCaptainId] = useState(null);
  const [viceCaptainId, setViceCaptainId] = useState(null);
  const [teamRating, setTeamRating] = useState(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersData, bestXIData] = await Promise.all([
          getPlayers(),
          getBestXI()
        ]);
        
        setAllPlayers(playersData);
        setBestXI(bestXIData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Update player and team counts whenever selected players change
    const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    const teamCounts = {};
    
    selectedPlayers.forEach(player => {
      counts[player.position] = (counts[player.position] || 0) + 1;
      teamCounts[player.team_name] = (teamCounts[player.team_name] || 0) + 1;
    });
    
    setSelectedPlayerCount(counts);
    setTeamPlayerCount(teamCounts);
  }, [selectedPlayers]);
  
  const getTotalCost = () => {
    return selectedPlayers.reduce((total, player) => total + (player.value / 10), 0);
  };
  
  const getRemainingBudget = () => {
    return TOTAL_BUDGET - getTotalCost();
  };
  
  const canAddPlayer = (player) => {
    // Check if player is already selected
    if (selectedPlayers.some(p => p.id === player.id)) {
      return false;
    }
    
    // Check position limits
    const positionCount = selectedPlayerCount[player.position] || 0;
    if (
      (player.position === 'GK' && positionCount >= MAX_GK) ||
      (player.position === 'DEF' && positionCount >= MAX_DEF) ||
      (player.position === 'MID' && positionCount >= MAX_MID) ||
      (player.position === 'FWD' && positionCount >= MAX_FWD)
    ) {
      return false;
    }
    
    // Check maximum players from same team
    const teamCount = teamPlayerCount[player.team_name] || 0;
    if (teamCount >= MAX_TEAM_PLAYERS) {
      return false;
    }
    
    // Check if cost exceeds budget
    if ((player.value / 10) > getRemainingBudget()) {
      return false;
    }
    
    // Check if total players would exceed 11
    if (selectedPlayers.length >= 11) {
      return false;
    }
    
    return true;
  };
  
  const addPlayer = (player) => {
    if (canAddPlayer(player)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };
  
  const removePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    
    // Remove captain/vice captain if that player is removed
    if (captainId === playerId) {
      setCaptainId(null);
    }
    if (viceCaptainId === playerId) {
      setViceCaptainId(null);
    }
  };
  
  const selectCaptain = (playerId) => {
    if (captainId === playerId) {
      setCaptainId(null);
    } else {
      setCaptainId(playerId);
      // If this player was vice captain, remove that role
      if (viceCaptainId === playerId) {
        setViceCaptainId(null);
      }
    }
  };
  
  const selectViceCaptain = (playerId) => {
    if (viceCaptainId === playerId) {
      setViceCaptainId(null);
    } else {
      setViceCaptainId(playerId);
      // If this player was captain, remove that role
      if (captainId === playerId) {
        setCaptainId(null);
      }
    }
  };
  
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !positionFilter || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });
  
  const useRecommendedTeam = () => {
    if (bestXI && bestXI.length > 0) {
      setSelectedPlayers(bestXI);
      setCaptainId(bestXI[0].id); // Just set first player as captain for example
      setViceCaptainId(bestXI[1].id); // Second player as vice
    }
  };
  
  const clearTeam = () => {
    setSelectedPlayers([]);
    setCaptainId(null);
    setViceCaptainId(null);
    setTeamRating(null);
  };
  
  const rateTeam = async () => {
    if (selectedPlayers.length !== 11 || !captainId || !viceCaptainId) {
      return;
    }
    
    setIsRatingLoading(true);
    try {
      const result = await submitTeamRating({
        players: selectedPlayers.map(p => p.id),
        captain: captainId,
        viceCaptain: viceCaptainId
      });
      
      setTeamRating(result.rating);
    } catch (error) {
      console.error('Error rating team:', error);
    } finally {
      setIsRatingLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Builder</h1>
      
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Players Selected</h2>
          <p className="text-3xl font-bold text-fpl-purple">{selectedPlayers.length}/11</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Remaining Budget</h2>
          <p className="text-3xl font-bold text-fpl-purple">£{getRemainingBudget().toFixed(1)}m</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Team Rating</h2>
          {teamRating ? (
            <p className="text-3xl font-bold text-fpl-purple">{teamRating}/100</p>
          ) : (
            <p className="text-gray-500">Not rated yet</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="flex flex-col space-y-2">
            <button 
              onClick={useRecommendedTeam}
              className="flex items-center justify-center bg-fpl-purple text-white px-4 py-2 rounded hover:bg-purple-900"
            >
              <FaRandom className="mr-2" />
              Use Recommended XI
            </button>
            <button 
              onClick={clearTeam}
              className="flex items-center justify-center bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              <FaTimes className="mr-2" />
              Clear Team
            </button>
          </div>
        </div>
      </div>
      
      {/* Formation Display - could be shown as visual pitch but simplified here */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Selected Players</h2>
        
        {selectedPlayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No players selected yet. Start building your team!</p>
          </div>
        ) : (
          <div>
            {/* Formation information */}
            <div className="mb-4 p-2 bg-gray-100 rounded-md text-center">
              <p className="font-medium">Formation: {selectedPlayerCount.DEF}-{selectedPlayerCount.MID}-{selectedPlayerCount.FWD}</p>
            </div>
            
            {/* Position groups */}
            {['GK', 'DEF', 'MID', 'FWD'].map(position => (
              <div key={position} className="mb-6">
                <h3 className="font-medium mb-2">
                  {position === 'GK' ? 'Goalkeepers' : 
                   position === 'DEF' ? 'Defenders' : 
                   position === 'MID' ? 'Midfielders' : 'Forwards'} 
                  ({selectedPlayers.filter(p => p.position === position).length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {selectedPlayers
                    .filter(player => player.position === position)
                    .map(player => (
                      <div key={player.id} className="relative">
                        <div className="absolute top-2 right-2 z-10 flex space-x-1">
                          <button
                            onClick={() => selectCaptain(player.id)}
                            className={`p-1 rounded-full ${
                              captainId === player.id ? 'bg-yellow-500' : 'bg-gray-200'
                            }`}
                            title="Captain"
                          >
                            <FaStar className={captainId === player.id ? 'text-white' : 'text-gray-600'} />
                          </button>
                          <button
                            onClick={() => selectViceCaptain(player.id)}
                            className={`p-1 rounded-full ${
                              viceCaptainId === player.id ? 'bg-gray-500' : 'bg-gray-200'
                            }`}
                            title="Vice Captain"
                          >
                            <FaStar className={viceCaptainId === player.id ? 'text-white' : 'text-gray-600'} size={12} />
                          </button>
                          <button
                            onClick={() => removePlayer(player.id)}
                            className="p-1 rounded-full bg-red-500 text-white"
                            title="Remove Player"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                        <PlayerCard player={player} />
                      </div>
                    ))}
                  
                  {/* Add player button if applicable */}
                  {(
                    (position === 'GK' && selectedPlayerCount.GK < MAX_GK) ||
                    (position === 'DEF' && selectedPlayerCount.DEF < MAX_DEF) ||
                    (position === 'MID' && selectedPlayerCount.MID < MAX_MID) ||
                    (position === 'FWD' && selectedPlayerCount.FWD < MAX_FWD)
                  ) && (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center p-4 h-40 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setPositionFilter(position);
                        setShowPlayerSelector(true);
                      }}
                    >
                      <div className="text-center">
                        <FaUserPlus className="mx-auto text-2xl text-gray-400 mb-2" />
                        <p className="text-gray-500">Add {
                          position === 'GK' ? 'Goalkeeper' : 
                          position === 'DEF' ? 'Defender' : 
                          position === 'MID' ? 'Midfielder' : 'Forward'
                        }</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Rate team button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={rateTeam}
                disabled={selectedPlayers.length !== 11 || !captainId || !viceCaptainId || isRatingLoading}
                className={`flex items-center bg-fpl-purple text-white px-6 py-3 rounded-lg text-lg ${
                  (selectedPlayers.length !== 11 || !captainId || !viceCaptainId || isRatingLoading) 
                    ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-900'
                }`}
              >
                {isRatingLoading ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Rating...</span>
                  </span>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Rate My Team
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Player selector modal */}
      {showPlayerSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Select Player</h2>
              <button
                onClick={() => setShowPlayerSelector(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpl-purple"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
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
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players match your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => addPlayer(player)}
                      className={`cursor-pointer ${canAddPlayer(player) ? 'opacity-100' : 'opacity-50'}`}
                    >
                      <PlayerCard player={player} />
                      {!canAddPlayer(player) && (
                        <div className="mt-1 text-xs text-red-500">
                          {selectedPlayers.some(p => p.id === player.id) ? 
                            'Already selected' : 
                            (player.value / 10) > getRemainingBudget() ?
                            'Exceeds budget' :
                            'Position limit reached'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;