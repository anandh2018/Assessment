import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        EKBMS
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/articles" className={({ isActive }) => isActive ? 'active' : ''}>
          Articles
        </NavLink>
        <NavLink to="/articles/create" className={({ isActive }) => isActive ? 'active' : ''}>
          Create Article
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
          Categories
        </NavLink>
        <NavLink to="/approval" className={({ isActive }) => isActive ? 'active' : ''}>
          Approval Queue
        </NavLink>
      </div>
    </nav>
  )
}
