import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/sc-technician/Sidebar'

export default function SCTechnicianLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="p-6 flex-1 bg-gray-50 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
