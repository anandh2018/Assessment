import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">&#9888;</span>
        <div>
          <div>CCRTS</div>
          <span className="brand-subtitle">Complaint &amp; Resolution Tracking</span>
        </div>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'active' : ''}
            end
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/complaints"
            className={({ isActive }) => isActive ? 'active' : ''}
            end
          >
            All Complaints
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/complaints/register"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Register Complaint
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
