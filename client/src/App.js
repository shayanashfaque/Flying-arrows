import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';

import ArticlePage from './components/Article';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

       
        

        {/* Article route */}
        <Route path="/:section/:id/:slug" element={<ArticlePage />} />
      </Routes>
    </Router>
  );
}

export default App;
