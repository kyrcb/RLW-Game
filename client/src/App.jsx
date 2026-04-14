import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HostView />} />
        <Route path="/join" element={<PlayerView />} />
      </Routes>
    </Router>
  );
}

export default App;
