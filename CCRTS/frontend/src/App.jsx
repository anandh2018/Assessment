import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ComplaintList from './pages/ComplaintList';
import RegisterComplaint from './pages/RegisterComplaint';
import ComplaintDetail from './pages/ComplaintDetail';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/complaints" element={<ComplaintList />} />
            <Route path="/complaints/register" element={<RegisterComplaint />} />
            <Route path="/complaints/:id" element={<ComplaintDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
