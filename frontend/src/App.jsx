import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Injuries from './pages/Injuries';
import Transfers from './pages/Transfers';
import TeamBuilder from './pages/TeamBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="players" element={<Players />} />
          <Route path="injuries" element={<Injuries />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="team-builder" element={<TeamBuilder />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;