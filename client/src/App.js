import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import Entertainment from './pages/Entertainment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/entertainment" element={<Entertainment />} />
      </Routes>
    </Router>
  );
}

export default App;
