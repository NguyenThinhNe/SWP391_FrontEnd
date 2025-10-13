import { NavLink } from 'react-router-dom'
import './sidebar.css'
import Logo from '../assets/group4.png'
import { House, ClipboardText, CalendarBlank, User, SignOut } from '@phosphor-icons/react'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="logo-img" src={Logo} alt="logo" />
      </div>
      <nav className="nav">
        <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon"><House size={18} weight="bold"/></span>
          <span className="nav-label">Dashboard</span>
        </NavLink>
        <NavLink to="/claim-requests" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon"><ClipboardText size={18} weight="bold"/></span>
          <span className="nav-label">Claim Requests</span>
        </NavLink>
        <NavLink to="/todo-works" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon"><CalendarBlank size={18} weight="bold"/></span>
          <span className="nav-label">Todo Works</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon"><User size={18} weight="bold"/></span>
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" type="button">
          <span className="logout-icon"><SignOut size={18} weight="bold"/></span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}
