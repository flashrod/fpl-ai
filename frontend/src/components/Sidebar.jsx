import { Link, useLocation } from 'react-router-dom';
import { 
  FaTimes, 
  FaHome, 
  FaUsers, 
  FaStethoscope, 
  FaExchangeAlt, 
  FaChessBoard 
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/players', label: 'Players', icon: <FaUsers /> },
    { path: '/injuries', label: 'Injuries', icon: <FaStethoscope /> },
    { path: '/transfers', label: 'Transfers', icon: <FaExchangeAlt /> },
    { path: '/team-builder', label: 'Team Builder', icon: <FaChessBoard /> },
  ];
  
  const activeClass = "bg-purple-800 text-white";
  const inactiveClass = "text-gray-300 hover:bg-purple-900 hover:text-white";
  
  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className={`absolute inset-y-0 left-0 max-w-xs w-full bg-fpl-purple transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">FPL Assistant</h2>
            <button 
              onClick={onClose}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="px-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path ? activeClass : inactiveClass
                }`}
                onClick={onClose}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 bg-fpl-purple text-white">
        <div className="p-4">
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                  location.pathname === item.path ? activeClass : inactiveClass
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;