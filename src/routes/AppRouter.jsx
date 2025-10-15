import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import scTechnicianRoutes from './scTechnicianRoutes'
import scStaffRoutes from './scStaffRoutes'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sc-staff" replace />} />
        {scTechnicianRoutes}
        {scStaffRoutes}
      </Routes>
    </BrowserRouter>
  )
}
