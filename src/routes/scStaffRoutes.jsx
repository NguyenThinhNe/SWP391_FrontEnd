import React from 'react'
import { Route } from 'react-router-dom'
import SCStaffLayout from '../layout/SCStaffLayout'
import Dashboard from '../pages/sc-staff/Dashboard'
import AssignWorker from '../pages/sc-staff/AssignWorker'
import WarrantyReport from '../pages/sc-staff/WarrantyReport'
import BillOfCharge from '../pages/sc-staff/BillOfCharge'
import Profile from '../pages/sc-staff/Profile'
import WarrantyRequestDetail from '../pages/sc-staff/WarrantyRequestDetail'
import PartRequests from '../pages/sc-staff/PartRequests'

export default (
  <Route path="/sc-staff" element={<SCStaffLayout />} key="sc-staff-root">
    <Route index element={<Dashboard />} />
    <Route path="assign-worker" element={<AssignWorker />} />
    <Route path="part-requests" element={<PartRequests />} />
    <Route path="warranty-report" element={<WarrantyReport />} />
    <Route path="bill-of-charge" element={<BillOfCharge />} />
    <Route path="profile" element={<Profile />} />
    <Route path="warranty-request/:id" element={<WarrantyRequestDetail />} />
  </Route>
)
