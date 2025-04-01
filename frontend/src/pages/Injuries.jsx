// src/pages/Injuries.jsx
import { useState, useEffect } from 'react';
import { getInjuries } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const Injuries = () => {
  const [loading, setLoading] = useState(true);
  const [injuries, setInjuries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  
  useEffect(() => {
    const fetchInjuries = async () => {
      try {
        setLoading(true);
        const data = await getInjuries();
        setInjuries(data);
      } catch (error) {
        console.error('Error fetching injuries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInjuries();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Get unique team names for filtering
  const teamNames = [...new Set(injuries.map(injury => injury.team))].sort();
  
  // Filter injuries based on search term and team filter
  const filteredInjuries = injuries.filter(injury => {
    const matchesSearch = injury.player_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = !teamFilter || injury.team === teamFilter;
    
    return matchesSearch && matchesTeam;
  });
  
  // Sort injuries by return date (null dates at the end)
  const sortedInjuries = [...filteredInjuries].sort((a, b) => {
    if (!a.return_date) return 1;
    if (!b.return_date) return -1;
    return new Date(a.return_date) - new Date(b.return_date);
  });
  
  // Function to get severity color
  const getSeverityColor = (status) => {
    switch (status.toLowerCase()) {
      case 'out':
        return 'bg-red-500';
      case 'doubtful':
        return 'bg-yellow-500';
      case 'questionable':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Injuries & Suspensions</h1>
      
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
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total Injured Players</h2>
          <p className="text-3xl font-bold text-fpl-purple">{injuries.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Players Out</h2>
          <p className="text-3xl font-bold text-red-500">
            {injuries.filter(i => i.status.toLowerCase() === 'out').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Doubtful Players</h2>
          <p className="text-3xl font-bold text-yellow-500">
            {injuries.filter(i => i.status.toLowerCase() === 'doubtful').length}
          </p>
        </div>
      </div>
      
      {/* Injuries list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {sortedInjuries.length === 0 ? (
          <div className="p-6 text-center">
            <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-2" />
            <p className="text-gray-600">No injury records match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-left">Team</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Reason</th>
                  <th className="py-3 px-4 text-left">Expected Return</th>
                  <th className="py-3 px-4 text-left">News</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {sortedInjuries.map((injury) => (
                  <tr key={`${injury.player_name}-${injury.team}`} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-left font-medium">{injury.player_name}</td>
                    <td className="py-3 px-4 text-left">{injury.team}</td>
                    <td className="py-3 px-4 text-left">
                      <span className={`${getSeverityColor(injury.status)} text-white px-2 py-1 rounded-full text-xs`}>
                        {injury.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left">{injury.reason || 'Not specified'}</td>
                    <td className="py-3 px-4 text-left">{formatDate(injury.return_date)}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="max-w-xs truncate">{injury.news || 'No updates'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Injuries;