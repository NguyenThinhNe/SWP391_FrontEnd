import React from "react";
import { Route } from "react-router-dom";
import Dashboard from "../pages/evm-staff/dashboard/Dashboard";
import Payment from "../pages/evm-staff/payment/Payment";
import ViewAllInvoice from "../pages/evm-staff/payment/ViewAllInvoice";
import ConfirmPayment from "../pages/evm-staff/payment/ConfirmPayment";
import Campaign from "../pages/evm-staff/campaign/Campaign";
import CreateCampaign from "../pages/evm-staff/campaign/CreateCampaign";
import ViewCampaign from "../pages/evm-staff/campaign/ViewCampaign";
import EditCampaign from "../pages/evm-staff/campaign/EditCampaign";
import Policy from "../pages/evm-staff/policy/Policy";
import PolicyDetails from "../pages/evm-staff/policy/PolicyDetails";
import EditPolicy from "../pages/evm-staff/policy/EditPolicy";
import Profile from "../pages/evm-staff/Profile";
import DashboardClaim from "../pages/evm-staff/dashboard/DashboardClaim";
import RejectClaim from "../pages/evm-staff/dashboard/RejectClaim";
import PartSupply from "../pages/evm-staff/dashboard/PartSupply";

export default (
  <>
    <Route index element={<Dashboard />} />
    <Route path="payment" element={<Payment />} />
    <Route path="payment/invoices" element={<ViewAllInvoice />} />
    <Route path="payment/confirm/:id" element={<ConfirmPayment />} />
    <Route path="campaign" element={<Campaign />} />
    <Route path="campaign/create" element={<CreateCampaign />} />
    <Route path="campaign/:id" element={<ViewCampaign />} />
    <Route path="campaign/:id/edit" element={<EditCampaign />} />
    <Route path="claim/:id" element={<DashboardClaim />} />
    <Route path="claim/:id/reject" element={<RejectClaim />} />
    <Route path="claim/:id/part-supply" element={<PartSupply />} />
    <Route path="policy" element={<Policy />} />
    <Route path="policy/:id" element={<PolicyDetails />} />
    <Route path="policy/edit/:id" element={<EditPolicy />} />
    <Route path="profile" element={<Profile />} />
  </>
);
