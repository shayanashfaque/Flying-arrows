import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import ArticlePage from './components/Article';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/:key" element={<Login />} />
        <Route path="/:section/:id/:slug" element={<ArticlePage />} />
      </Routes>
    </Router>
  );
}

export default App;
