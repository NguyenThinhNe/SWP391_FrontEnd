import React from 'react'
import { NavLink } from 'react-router-dom'
import { HouseIcon, CurrencyDollarIcon,CalendarCheckIcon,FileIcon, UserIcon, MinusCircleIcon } from '@phosphor-icons/react'
import logo from '../../assets/group4.png'

const NavItem = ({ to, icon: Icon, label, end }) => {
  const isMatch = (path) => {
    const currentPath = window.location.pathname;
    if (path === '/evm-staff' && currentPath.includes('/evm-staff/claim')) {
      return true;
    }
    if (path === '/evm-staff/campaign' && currentPath.includes('/evm-staff/campaign')) {
      return true;
    }
    if (path === '/evm-staff/policy' && currentPath.includes('/evm-staff/policy')) {
      return true;
    }
    return currentPath === path;
  };

  return (
    <NavLink end={end} to={to} className={({ isActive }) => `flex items-center gap-3 w-52 px-4 py-3 rounded-full justify-start cursor-pointer transition-colors ${isMatch(to) ? 'bg-indigo-600 text-white' :  'hover:bg-[#F1F3F4] text-gray-600'}`}>
      {({ isActive }) => (
        <>
          <div className={`flex items-center justify-center w-8 h-8 ${isMatch(to) ? 'text-white' : 'text-gray-500'}`}>
            <Icon size={18} weight="bold" />
          </div>
          <div className="text-sm font-medium">{label}</div>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed w-64 h-[calc(100vh-64px)] border-r-2 border-gray-200 bg-white flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center py-6">
          <img src={logo} alt="logo" className="w-24 h-24 object-contain" />
        </div>

        <nav className="pl-6 flex flex-col gap-3">
          <div className="py-2">
            <NavItem end={true} to="/evm-staff" icon={HouseIcon} label="Dashboard" />
          </div>
          <div className="py-2">
            <NavItem to="/evm-staff/payment" icon={CurrencyDollarIcon} label="Payment" />
          </div>
          <div className="py-2">
            <NavItem to="/evm-staff/campaign" icon={CalendarCheckIcon} label="Campaign" />
          </div>
          <div className="py-2">
            <NavItem to="/evm-staff/policy" icon={FileIcon} label="Policy" />
          </div>
          <div className="py-2">
            <NavItem to="/evm-staff/profile" icon={UserIcon} label="Profile" />
          </div>

        </nav>
      </div>

      <div className="px-6 py-6">
        <div className="py-0">
            <NavItem to="/login" icon={MinusCircleIcon} label="Logout" />
        </div>
      </div>
    </aside>
  )
}



