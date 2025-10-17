import React from 'react'
import { NavLink } from 'react-router-dom'
import { House, PencilLine, ClipboardText, Receipt, User, SignOut } from 'phosphor-react'

const NavItem = ({ to, icon: Icon, label, end }) => (
  <NavLink 
    end={end} 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 w-[250px] px-4 py-3 rounded-2xl transition-colors ${
        isActive 
          ? 'bg-[#626AE7] text-white' 
          : 'bg-white text-[#727674] hover:bg-gray-50'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-[#727674]'}`}>
          <Icon size={27} weight="fill" />
        </div>
        <div className="text-xl font-semibold">{label}</div>
      </>
    )}
  </NavLink>
)

export default function Sidebar() {
  return (
    <aside className="w-[314px] h-screen border-r-[3px] border-[#EBEBEB] bg-white flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 px-[52px] py-6">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M25 0H0L25 25H0L25 50H50L25 25H50L25 0Z" fill="black"/>
          </svg>
          <div className="text-[30px] font-bold">ELV</div>
        </div>

        <nav className="px-7 flex flex-col gap-3 mt-20">
          <NavItem end={true} to="/sc-staff" icon={House} label="Dashboard" />
          <NavItem to="/sc-staff/assign-worker" icon={PencilLine} label="Assign Worker" />
          <NavItem to="/sc-staff/part-requests" icon={PencilLine} label="Part requests" />
          <NavItem to="/sc-staff/warranty-report" icon={ClipboardText} label="Warranty Report" />
          <NavItem to="/sc-staff/bill-of-charge" icon={Receipt} label="Bill Of Charge" />
          <NavItem to="/sc-staff/profile" icon={User} label="Profile" />
        </nav>
      </div>

      <div className="px-7 pb-16 flex flex-col gap-3">
        <div className="flex items-center gap-3 w-[250px] px-4 py-3 rounded-2xl bg-white">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/42aeab4b298e509911de4fd2165f9f40d61557ee?width=54" 
            alt="user" 
            className="w-[27px] h-[27px] rounded-full"
          />
          <div className="text-xl font-semibold text-[#727674]">SC Staff</div>
        </div>
        <button className="flex items-center gap-3 w-[250px] px-4 py-3 rounded-2xl bg-white text-[#727674] hover:bg-gray-50 transition-colors">
          <SignOut size={27} />
          <span className="text-xl font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  )
}
