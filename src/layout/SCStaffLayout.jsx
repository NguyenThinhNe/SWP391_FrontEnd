import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/sc-staff/Sidebar'

export default function SCStaffLayout() {
  return (
    <div className="w-screen flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 w-full min-w-0 bg-white min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
