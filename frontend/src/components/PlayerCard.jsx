import { FaUser, FaFootballBall, FaPoundSign } from 'react-icons/fa';

const getStatusColor = (status) => {
  if (!status || status === 'a') return 'bg-green-500';
  if (status === 'd') return 'bg-yellow-500';
  return 'bg-red-500';
};

const PlayerCard = ({ player }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{player.name}</h3>
            <p className="text-gray-600">{player.team_name} - {player.position}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(player.status)}`}></div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Points</span>
            <span className="font-semibold">{player.total_points}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Form</span>
            <span className="font-semibold">{player.form}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Value</span>
            <span className="font-semibold">£{(player.value / 10).toFixed(1)}m</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Selection %</span>
            <span className="font-semibold">{player.selected_by_percent}%</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <FaFootballBall className="text-gray-400 mr-1" />
              <span>{player.goals_scored} G</span>
              <span className="mx-1">|</span>
              <span>{player.assists} A</span>
            </div>
            <div className="flex items-center">
              <span>Next: {typeof player.next_opponent === 'string' ? player.next_opponent : `Team ${player.next_opponent}`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;