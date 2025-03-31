// src/components/StatCard.jsx
const StatCard = ({ title, value, icon, color = 'bg-blue-500' }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`${color} p-3 rounded-full`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };
  
  export default StatCard;
  