// src/pages/Transfers.jsx
import { useState, useEffect } from 'react';
import { getPlayers, getTransfers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PlayerCard from '../components/PlayerCard';
import { FaExchangeAlt, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';

const Transfers = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [transferSuggestions, setTransferSuggestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('in'); // 'in' or 'out'
  const [selectedPosition, setSelectedPosition] = useState('');
  const [teamValue, setTeamValue] = useState(100.0);
  const [remainingTransfers, setRemainingTransfers] = useState(2); // Default FPL value
  const [savedTransfers, setSavedTransfers] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersData, transfersData] = await Promise.all([
          getPlayers(),
          getTransfers()
        ]);
        
        setPlayers(playersData);
        setTransferSuggestions(transfersData.suggestions || []);
        
        // You might want to get these values from an API in a real app
        setTeamValue(transfersData.team_value || 100.0);
        setRemainingTransfers(transfersData.remaining_transfers || 2);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Get players to transfer in/out based on selected tab and position
  const getFilteredSuggestions = () => {
    return transferSuggestions.filter(suggestion => {
      const isMatchingDirection = selectedTab === 'in' ? 
        suggestion.direction === 'in' : suggestion.direction === 'out';
      const isMatchingPosition = !selectedPosition || suggestion.player.position === selectedPosition;
      return isMatchingDirection && isMatchingPosition;
    });
  };
  
  const filteredSuggestions = getFilteredSuggestions();
  
  // Function to handle transfer selection
  const handleTransferSelect = (suggestion) => {
    if (remainingTransfers <= 0) return;
    
    // Check if this transfer is already saved
    const isAlreadySaved = savedTransfers.some(transfer => 
      transfer.player.name === suggestion.player.name && transfer.direction === suggestion.direction
    );
    
    if (isAlreadySaved) {
      // Remove from saved transfers
      setSavedTransfers(savedTransfers.filter(transfer => 
        transfer.player.name !== suggestion.player.name || transfer.direction !== suggestion.direction
      ));
      setRemainingTransfers(remainingTransfers + 1);
    } else {
      // Add to saved transfers
      setSavedTransfers([...savedTransfers, suggestion]);
      setRemainingTransfers(remainingTransfers - 1);
    }
  };
  
  // Calculate new team value based on transfers
  const newTeamValue = savedTransfers.reduce((total, transfer) => {
    if (transfer.direction === 'in') {
      return total - (transfer.player.value / 10);
    } else {
      return total + (transfer.player.value / 10);
    }
  }, teamValue);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transfer Suggestions</h1>
      
      {/* Team value and transfers info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Team Value</h2>
          <p className="text-3xl font-bold text-fpl-purple">£{teamValue.toFixed(1)}m</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">New Team Value</h2>
          <p className="text-3xl font-bold text-fpl-purple">£{newTeamValue.toFixed(1)}m</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Remaining Transfers</h2>
          <p className="text-3xl font-bold text-fpl-purple">{remainingTransfers}</p>
        </div>
      </div>
      
      {/* Saved transfers */}
      {savedTransfers.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-3">Saved Transfers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {savedTransfers.map((transfer, index) => (
              <div key={index} className="flex items-center border border-gray-200 rounded-lg p-3">
                <div className={`mr-3 ${transfer.direction === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                  {transfer.direction === 'in' ? <FaArrowUp size={24} /> : <FaArrowDown size={24} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{transfer.player.name}</p>
                  <p className="text-sm text-gray-600">
                    {transfer.player.team_name} - {transfer.player.position} - £{(transfer.player.value / 10).toFixed(1)}m
                  </p>
                </div>
                <button
                  onClick={() => handleTransferSelect(transfer)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="flex items-center bg-fpl-purple text-white px-4 py-2 rounded hover:bg-purple-900">
              <FaSave className="mr-2" />
              Confirm Transfers
            </button>
          </div>
        </div>
      )}
      
      {/* Transfers tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 font-medium text-center ${
              selectedTab === 'in' ? 'text-fpl-purple border-b-2 border-fpl-purple' : 'text-gray-600'
            }`}
            onClick={() => setSelectedTab('in')}
          >
            Players to Transfer In
          </button>
          <button
            className={`flex-1 py-3 font-medium text-center ${
              selectedTab === 'out' ? 'text-fpl-purple border-b-2 border-fpl-purple' : 'text-gray-600'
            }`}
            onClick={() => setSelectedTab('out')}
          >
            Players to Transfer Out
          </button>
        </div>
      </div>
      
      {/* Position filter */}
      <div className="flex mb-6 space-x-2">
        <button
          className={`px-4 py-2 rounded-full ${
            selectedPosition === '' ? 'bg-fpl-purple text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPosition('')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedPosition === 'GK' ? 'bg-fpl-purple text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPosition('GK')}
        >
          Goalkeepers
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedPosition === 'DEF' ? 'bg-fpl-purple text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPosition('DEF')}
        >
          Defenders
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedPosition === 'MID' ? 'bg-fpl-purple text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPosition('MID')}
        >
          Midfielders
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedPosition === 'FWD' ? 'bg-fpl-purple text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPosition('FWD')}
        >
          Forwards
        </button>
      </div>
      
      {/* Transfer suggestions */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FaExchangeAlt className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600">No {selectedTab === 'in' ? 'incoming' : 'outgoing'} transfer suggestions available for the selected position.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSuggestions.map((suggestion, index) => (
            <div key={index} className="relative">
              <div className={`absolute top-2 right-2 z-10 p-2 rounded-full ${
                suggestion.direction === 'in' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}>
                {suggestion.direction === 'in' ? <FaArrowUp /> : <FaArrowDown />}
              </div>
              
              <div
                className={`cursor-pointer transform transition-transform hover:scale-105 ${
                  savedTransfers.some(t => 
                    t.player.name === suggestion.player.name && t.direction === suggestion.direction
                  ) ? 'ring-2 ring-fpl-purple' : ''
                }`}
                onClick={() => handleTransferSelect(suggestion)}
              >
                <PlayerCard player={suggestion.player} />
              </div>
              
              {suggestion.reason && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm">
                  <p className="font-medium">Recommendation reason:</p>
                  <p>{suggestion.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transfers;