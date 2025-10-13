import React from 'react'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">⧫⧫</div>
          <div className="brand-name">ELV</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        <ul>
          <li className="active">
            <button className="nav-item">
              <span className="icon" aria-hidden>🏠</span>
              <span className="label">Dashboard</span>
            </button>
          </li>
          <li>
            <button className="nav-item">
              <span className="icon" aria-hidden>🧑‍🔧</span>
              <span className="label">Assign Worker</span>
            </button>
          </li>
          <li>
            <button className="nav-item">
              <span className="icon" aria-hidden>📋</span>
              <span className="label">Warranty Report</span>
            </button>
          </li>
          <li>
            <button className="nav-item">
              <span className="icon" aria-hidden>🧾</span>
              <span className="label">Bill Of Charge</span>
            </button>
          </li>
          <li>
            <button className="nav-item">
              <span className="icon" aria-hidden>👤</span>
              <span className="label">Profile</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <div className="user">
          <div className="avatar">SC</div>
          <div className="user-name">SC Staff</div>
        </div>
        <button className="logout" aria-label="Logout">
          <span className="logout-icon" aria-hidden>⎋</span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}
