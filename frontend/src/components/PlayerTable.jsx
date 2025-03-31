import { useState } from 'react';

const PlayerTable = ({ players, onPlayerSelect }) => {
  const [sortField, setSortField] = useState('total_points');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortedPlayers = [...players].sort((a, b) => {
    if (a[sortField] === b[sortField]) return 0;
    
    if (sortDirection === 'asc') {
      return a[sortField] < b[sortField] ? -1 : 1;
    } else {
      return a[sortField] > b[sortField] ? -1 : 1;
    }
  });
  
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('name')}>
              Player {renderSortIcon('name')}
            </th>
            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('team_name')}>
              Team {renderSortIcon('team_name')}
            </th>
            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('position')}>
              Pos {renderSortIcon('position')}
            </th>
            <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('total_points')}>
              Pts {renderSortIcon('total_points')}
            </th>
            <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('form')}>
              Form {renderSortIcon('form')}
            </th>
            <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('value')}>
              Value {renderSortIcon('value')}
            </th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {sortedPlayers.map((player) => (
            <tr key={player.name} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-left">{player.name}</td>
              <td className="py-3 px-4 text-left">{player.team_name}</td>
              <td className="py-3 px-4 text-left">{player.position}</td>
              <td className="py-3 px-4 text-right">{player.total_points}</td>
              <td className="py-3 px-4 text-right">{player.form}</td>
              <td className="py-3 px-4 text-right">£{(player.value / 10).toFixed(1)}m</td>
              <td className="py-3 px-4 text-center">
                {onPlayerSelect && (
                  <button 
                    onClick={() => onPlayerSelect(player)}
                    className="bg-fpl-purple text-white px-3 py-1 rounded text-xs hover:bg-purple-900"
                  >
                    Select
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;