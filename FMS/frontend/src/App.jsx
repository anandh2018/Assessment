import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FeedbackList from './pages/FeedbackList';
import SubmitFeedback from './pages/SubmitFeedback';
import Search from './pages/Search';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">📋</span>
            <span className="brand-name">Feedback Management System</span>
          </div>
          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
            <NavLink to="/feedback" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              All Feedback
            </NavLink>
            <NavLink to="/submit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Submit Feedback
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Search
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/feedback" element={<FeedbackList />} />
            <Route path="/submit" element={<SubmitFeedback />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Feedback Management System &copy; 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
