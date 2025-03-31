import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const Navbar = ({ onMenuClick }) => {
  return (
    <nav className="bg-fpl-purple text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-200 hover:text-white focus:outline-none"
              onClick={onMenuClick}
            >
              <FaBars className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center">
              <img 
                src="https://fantasy.premierleague.com/favicon.ico" 
                alt="FPL Logo" 
                className="h-8 w-8 mr-2"
              />
              <span className="font-bold text-xl">FPL Assistant</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800"
            >
              Dashboard
            </Link>
            <Link 
              to="/players" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800"
            >
              Players
            </Link>
            <Link 
              to="/injuries" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800"
            >
              Injuries
            </Link>
            <Link 
              to="/transfers" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800"
            >
              Transfers
            </Link>
            <Link 
              to="/team-builder" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800"
            >
              Team Builder
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;