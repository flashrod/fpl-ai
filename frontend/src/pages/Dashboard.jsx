import { useState, useEffect } from 'react';
import { getPlayers, getInjuries, getCaptain, getBestXI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PlayerCard from '../components/PlayerCard';
import StatCard from '../components/StatCard';
import { FaStar, FaUsers, FaBan, FaChartLine } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [bestXI, setBestXI] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersData, injuriesData, captainData, bestXIData] = await Promise.all([
          getPlayers(),
          getInjuries(),
          getCaptain(),
          getBestXI()
        ]);
        
        setPlayers(playersData);
        setInjuries(injuriesData);
        setCaptain(captainData);
        setBestXI(bestXIData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Prepare data for charts
  const positionData = players.reduce((acc, player) => {
    const position = player.position;
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {});
  
  const positionChartData = Object.keys(positionData).map(pos => ({
    name: pos,
    value: positionData[pos]
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Top 5 players by points
  const topPlayers = [...players]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Players" 
          value={players.length} 
          icon={<FaUsers className="text-white" />} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Injuries" 
          value={injuries.length} 
          icon={<FaBan className="text-white" />} 
          color="bg-red-500"
        />
        <StatCard 
          title="Top Captain" 
          value={captain?.name || 'N/A'} 
          icon={<FaStar className="text-white" />} 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Avg. Points" 
          value={Math.round(players.reduce((sum, p) => sum + p.total_points, 0) / players.length)} 
          icon={<FaChartLine className="text-white" />} 
          color="bg-green-500"
        />
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Players by Position</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={positionChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {positionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Top Players by Points</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPlayers}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_points" fill="#37003c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Best captain suggestion */}
      {captain && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Recommended Captain</h2>
          <div className="max-w-md">
            <PlayerCard player={captain} />
          </div>
        </div>
      )}
      
      {/* Top in-form players */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Top In-Form Players</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {players
            .sort((a, b) => b.form - a.form)
            .slice(0, 4)
            .map(player => (
              <PlayerCard key={player.name} player={player} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
