import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusCircleIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import ConfirmDialog from "../../../components/system-components/ConfirmDialog.jsx";

const sampleCampaigns = Array.from({ length: 10 }).map((_, i) => ({
  id: `CP-00${i + 1}`,
  name: `Campaign ${i + 1}`,
  startDate: "2024-07-21",
  endDate: "2024-08-21",
  status: [
    "Active",
    "Completed",
    "Active",
    "Pending",
    "Active",
    "Completed",
    "Pending",
    "Active",
    "Completed",
    "Pending",
  ][i],
}));

const stats = [
  { id: 1, title: "Total Campaigns", value: "24", subtitle: "All time" },
  {
    id: 2,
    title: "Active Campaigns",
    value: "12",
    subtitle: "Currently running",
  },
  {
    id: 3,
    title: "Completed Campaigns",
    value: "8",
    subtitle: "Successfully ended",
  },
  { id: 4, title: "Pending Campaigns", value: "4", subtitle: "Awaiting start" },
];

const statusColorMap = {
  Active: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const cardColorMap = {
  1: "border-gray-200",
  2: "border-green-200",
  3: "border-blue-200",
  4: "border-yellow-200",
};

const titleColorMap = {
  1: "text-gray-400",
  2: "text-green-600",
  3: "text-blue-600",
  4: "text-yellow-600",
};

export default function Campaign() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    campaignId: null,
  });

  const handleCreateCampaign = () => {
    navigate("/evm-staff/campaign/create");
  };

  const handleView = (campaignId) => {
    setActiveMenu(null);
    navigate(`/evm-staff/campaign/${campaignId}`);
  };

  const handleDelete = (campaignId) => {
    setActiveMenu(null);
    setDeleteDialog({ isOpen: true, campaignId });
  };

  const confirmDelete = () => {
    // TODO: Implement delete API call here
    console.log("Deleting campaign:", deleteDialog.campaignId);
    setDeleteDialog({ isOpen: false, campaignId: null });
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campaign Management</h1>
        <p className="text-gray-500">
          View and manage all your marketing campaigns
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={
              "flex flex-col p-6 bg-white rounded-2xl border-2 " +
              cardColorMap[stat.id]
            }
          >
            <p className={"text-sm font-medium " + titleColorMap[stat.id]}>
              {stat.title}
            </p>
            <p className="text-2xl font-bold mt-2 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-2xl border-2 border-gray-200">
        <div className="p-6 border-b-2 border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Campaign List</h2>
          <button
            onClick={handleCreateCampaign}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusCircleIcon size={20} />
            <span>Create Campaign</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Campaign ID
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Start Date
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  End Date
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {sampleCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {campaign.id}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium">
                    {campaign.name}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {campaign.startDate}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {campaign.endDate}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={
                        "px-3 py-1 text-sm font-medium rounded-full " +
                        statusColorMap[campaign.status]
                      }
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === campaign.id ? null : campaign.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <DotsThreeIcon size={24} className="text-gray-600" />
                      </button>

                      {activeMenu === campaign.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => handleView(campaign.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, campaignId: null })}
          onConfirm={confirmDelete}
          title="Delete Campaign"
          message={`Are you sure you want to delete campaign ${deleteDialog.campaignId}? This action cannot be undone.`}
        />

        {/* Pagination */}
        <div className="p-6 border-t-2 border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 1-10 of 24 campaigns</p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <CaretLeftIcon size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <CaretRightIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
