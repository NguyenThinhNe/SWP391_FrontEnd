import React from 'react'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 bg-white shadow">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
