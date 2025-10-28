import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/evm-staff/Sidebar'

export default function EVMStaffLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="flex">
        <div className="w-64 shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 p-6">
          <header className="p-4 bg-white shadow">EVM Staff header</header>
          <Outlet />
        </main>
      </div>
    </div>
  )
}