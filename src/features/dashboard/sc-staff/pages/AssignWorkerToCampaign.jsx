import { useState, useMemo, useEffect } from "react";
import {
  CheckCircleIcon,
  SpinnerIcon,
  ListDashesIcon,
  UserCirclePlusIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../../../app/AuthProvider";
import { useCampaignsApi } from "../../../../api/useCampaignsApi";
import { useVehicleApi } from "../../../../api/useVehicleApi";
import { useTechnicians } from "../hooks/useTechnicians";
import { useModal } from "../hooks/useModal";
import StatusCard from "../../../../components/StatusCard";
import FilterTabs from "../components/FilterTabs";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import Loader from "../../../../components/Loader";
import { SuccessNotification, ErrorNotification } from "../../../../components/Notification";
import axiosInstance from "../../../../api/axiousInstance";

// Campaign Card Component (similar to WorkOrderCard)
const CampaignCard = ({ campaign, onAssignClick, onAddVehicleClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      0: "bg-yellow-100 text-yellow-800 border-yellow-300", // Pending
      1: "bg-blue-100 text-blue-800 border-blue-300",       // In Progress
      2: "bg-green-100 text-green-800 border-green-300",    // Completed
      3: "bg-red-100 text-red-800 border-red-300",          // Overdue
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="border-[3px] border-[#EBEBEB] rounded-2xl p-6 hover:shadow-lg transition-all bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-[17px] font-semibold text-black mb-2">
            {campaign.campaignName}
          </h3>
          <p className="text-[13px] text-gray-600 mb-2 line-clamp-2">
            {campaign.description || "No description"}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(campaign.status)}`}>
          {campaign.statusDisplay}
        </span>
      </div>

      {/* Campaign Details */}
      <div className="space-y-2 mb-4 text-[13px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Start Date:</span>
          <span className="font-medium text-black">{campaign.startDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">End Date:</span>
          <span className="font-medium text-black">{campaign.endDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Vehicles:</span>
          <span className="font-medium text-black">{campaign.vehicleCount} vehicles</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Assigned To:</span>
          <span className="font-medium text-black">{campaign.technicianName || "Unassigned"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onAddVehicleClick(campaign)}
          className="w-full px-4 py-2.5 border-2 border-[#626AE7] text-[#626AE7] rounded-xl font-medium text-[13px] hover:bg-[#626AE7] hover:text-white transition-colors"
        >
          Add Vehicle
        </button>
        <div className="relative">
          <button
            onClick={() => campaign.vehicleCount > 0 && onAssignClick(campaign)}
            disabled={campaign.vehicleCount === 0}
            className={`w-full px-4 py-2.5 rounded-xl font-medium text-[13px] transition-colors ${
              campaign.vehicleCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#626AE7] text-white hover:bg-[#5159c9]'
            }`}
            title={campaign.vehicleCount === 0 ? "Please add vehicles first" : ""}
          >
            {campaign.technicianId ? "Reassign Worker" : "Assign Worker"}
          </button>
          {campaign.vehicleCount === 0 && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Add vehicles before assigning worker
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Vehicle Modal
const AddVehicleModal = ({ isOpen, onClose, selectedCampaign, onAddVehicle, availableVehicles, vehiclesLoading }) => {
  const [selectedVin, setSelectedVin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVin("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedVin) {
      alert("Please select a vehicle");
      return;
    }
    
    setIsSubmitting(true);
    await onAddVehicle(selectedCampaign, selectedVin);
    setIsSubmitting(false);
  };

  // Get selected vehicle details
  const selectedVehicle = availableVehicles.find(v => v.vin === selectedVin);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold text-black mb-6">Add Vehicle to Campaign</h2>
        
        {/* Campaign Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Campaign</p>
          <p className="font-semibold text-black">{selectedCampaign?.campaignName}</p>
          <p className="text-sm text-gray-600 mt-2">{selectedCampaign?.vehicleCount} vehicles currently</p>
        </div>

        {/* Vehicle Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vehicle *
          </label>
          {vehiclesLoading ? (
            <div className="flex items-center justify-center py-3">
              <SpinnerIcon className="w-5 h-5 animate-spin text-[#626AE7]" />
              <span className="ml-2 text-sm text-gray-500">Loading vehicles...</span>
            </div>
          ) : (
            <>
              <select
                value={selectedVin}
                onChange={(e) => setSelectedVin(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#626AE7] transition-colors"
                disabled={isSubmitting}
              >
                <option value="">-- Select a vehicle --</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.vin} value={vehicle.vin}>
                    {vehicle.vehicleName} - {vehicle.model} ({vehicle.vin?.substring(0, 8)}...)
                  </option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No vehicles available. Please add vehicles first.
                </p>
              )}
            </>
          )}
        </div>

        {/* Selected Vehicle Details */}
        {selectedVehicle && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 mb-1">Selected Vehicle</p>
            <p className="font-medium text-black text-sm">{selectedVehicle.vehicleName}</p>
            <p className="text-xs text-gray-600">Model: {selectedVehicle.model}</p>
            <p className="text-xs text-gray-600">VIN: {selectedVehicle.vin}</p>
            {selectedVehicle.customerName && (
              <p className="text-xs text-gray-600">Owner: {selectedVehicle.customerName}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-[#EBEBEB] text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedVin}
            className="flex-1 px-6 py-3 bg-[#626AE7] text-white rounded-xl font-medium hover:bg-[#5159c9] transition-colors disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Vehicle"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Campaign Assign Modal (adapted from AssignTechnicianModal)
const CampaignAssignModal = ({ isOpen, onClose, selectedCampaign, availableTechnicians, onAssign }) => {
  const [selectedTechId, setSelectedTechId] = useState("");

  // Reset selected tech when modal opens with a campaign
  useEffect(() => {
    if (isOpen && selectedCampaign) {
      // If campaign already has a technician, pre-select it
      setSelectedTechId(selectedCampaign.technicianId || "");
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedTechId("");
    }
  }, [isOpen, selectedCampaign]);

  if (!isOpen) return null;

  const handleAssign = () => {
    if (!selectedTechId) {
      alert("Please select a technician");
      return;
    }
    const technician = availableTechnicians.find(t => t.id === selectedTechId);
    if (!technician) {
      alert("Invalid technician selected");
      return;
    }
    console.log("🔵 Assigning:", { campaign: selectedCampaign, technician });
    onAssign(selectedCampaign, technician);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold text-black mb-6">Assign Technician to Campaign</h2>
        
        {/* Campaign Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Campaign</p>
          <p className="font-semibold text-black">{selectedCampaign?.campaignName}</p>
          <p className="text-sm text-gray-600 mt-2">{selectedCampaign?.vehicleCount} vehicles</p>
        </div>

        {/* Technician Select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Technician *
          </label>
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#626AE7] transition-colors"
          >
            <option value="">-- Select a technician --</option>
            {availableTechnicians.map((tech) => (
              <option 
                key={tech.id} 
                value={tech.id}
              >
                {tech.name}
                {tech.assignedTasks > 0 ? ` (${tech.assignedTasks} tasks)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-[#EBEBEB] text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 px-6 py-3 bg-[#626AE7] text-white rounded-xl font-medium hover:bg-[#5159c9] transition-colors"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

// Campaign Status Filters (array of strings to match FilterTabs component)
// Backend status: 0=Pending (Awaiting start), 1=Completed (Finished), 2=Active (Currently running)
const CAMPAIGN_FILTERS = ["All", "Pending", "Completed", "Active"];

export default function AssignWorkerToCampaign() {
  const auth = useAuth();
  const user = auth?.user;
  const [notification, setNotification] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch campaigns, technicians, and vehicles
  const {
    campaigns,
    loading: campaignsLoading,
    refetch,
    applyCampaignTechnicianUpdate,
  } = useCampaignsApi(user?.serviceCenterId);
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { vehicles, vehicleLoading } = useVehicleApi();

  // Modal management for Assign Worker
  const {
    isOpen: showAssignModal,
    selectedItem: selectedCampaign,
    openModal: openAssignModal,
    closeModal: closeAssignModal,
  } = useModal();

  // Modal management for Add Vehicle
  const {
    isOpen: showAddVehicleModal,
    selectedItem: selectedCampaignForVehicle,
    openModal: openAddVehicleModal,
    closeModal: closeAddVehicleModal,
  } = useModal();

  const filters = CAMPAIGN_FILTERS;

  // Enrich campaigns with technician names from technicians list
  const enrichedCampaigns = useMemo(() => {
    return campaigns.map(campaign => {
      if (campaign.technicianId && campaign.technicianName === "Unassigned") {
        // Backend didn't return technicianName, lookup from technicians list
        const tech = technicians.find(t => t.id === campaign.technicianId);
        if (tech) {
          return { ...campaign, technicianName: tech.name };
        }
      }
      return campaign;
    });
  }, [campaigns, technicians]);

  // Filter campaigns by status and search term
  const displayCampaigns = useMemo(() => {
    let result = enrichedCampaigns;

    // Filter by status
    if (activeFilter !== "All") {
      result = result.filter(c => c.statusDisplay === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(c =>
        c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [enrichedCampaigns, activeFilter, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const pendingCount = campaigns.filter(c => c.status === 0).length;
    const completedCount = campaigns.filter(c => c.status === 1).length;
    const activeCount = campaigns.filter(c => c.status === 2).length;
    const unassignedCount = campaigns.filter(c => !c.technicianId).length;

    return [
      {
        count: pendingCount.toString(),
        label: "Pending",
        icon: ListDashesIcon,
        description: "Awaiting start",
      },
      {
        count: activeCount.toString(),
        label: "Active",
        icon: SpinnerIcon,
        iconColor: "#0FC3EB",
        description: "Currently active",
      },
      {
        count: completedCount.toString(),
        label: "Completed",
        icon: CheckCircleIcon,
        iconColor: "#00a63e",
        description: "Finished campaigns",
      },
      {
        count: unassignedCount.toString(),
        label: "Unassigned",
        icon: UserCirclePlusIcon,
        iconColor: "#EBB80F",
        description: "Need assignment",
      },
    ];
  }, [campaigns]);

  // Get filter count
  const getFilterCount = (filter) => {
    if (filter === "All") return campaigns.length;
    return campaigns.filter(c => c.statusDisplay === filter).length;
  };

  // Handle assign technician
  const handleAssignTechnician = async (campaign, technician) => {
    try {
      console.group('🔵 Assigning technician to campaign');
      console.log('📋 Campaign:', {
        id: campaign.campaignId,
        name: campaign.campaignName,
        status: campaign.status,
        vehicleCount: campaign.vehicleCount,
        serviceCenterId: campaign.serviceCenterId,
        currentTechnicianId: campaign.technicianId
      });
      console.log('👤 Technician:', {
        id: technician.id,
        name: technician.name,
        serviceCenterId: technician.serviceCenterId,
        assignedTasks: technician.assignedTasks
      });
      console.log('🔐 User:', {
        serviceCenterId: user?.serviceCenterId
      });
      console.groupEnd();
      
      // Validate campaign has vehicles
      if (!campaign.vehicleCount || campaign.vehicleCount === 0) {
        throw new Error('Campaign must have vehicles before assigning technician');
      }

      // Check if technician is already assigned to another active campaign
      const technicianCurrentCampaigns = enrichedCampaigns.filter(c => 
        c.technicianId === technician.id && 
        c.campaignId !== campaign.campaignId &&
        c.status === 2 // Active status
      );

      if (technicianCurrentCampaigns.length > 0) {
        const assignedCampaignNames = technicianCurrentCampaigns.map(c => c.campaignName).join(', ');
        setNotification({
          type: 'error',
          message: 'Worker not available',
          subText: `${technician.name} is already assigned to active campaign(s): ${assignedCampaignNames}`
        });
        return;
      }
      
      console.log(`🌐 POST /campaigns/${campaign.campaignId}/technicians/${technician.id}`);
      
      // Backend endpoint: POST /api/campaigns/{id}/technicians/{technicianId}
      // No body needed - IDs are in the URL path
      await axiosInstance.post(
        `/campaigns/${campaign.campaignId}/technicians/${technician.id}`
      );
      
      console.log('✅ Technician assigned successfully');

      applyCampaignTechnicianUpdate(campaign.campaignId, technician);

      closeAssignModal();
      
      setNotification({
        type: 'success',
        message: 'Technician assigned successfully!',
        subText: `${technician.name} has been assigned to ${campaign.campaignName}`
      });

      // Refetch campaigns shortly after backend updates
      setTimeout(() => {
        refetch();
      }, 300);
    } catch (error) {
      console.error("❌ Assign technician failed:", error);
      
      // Parse backend error message
      let errorMessage = 'Failed to assign technician';
      let errorSubText = '';
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        if (backendMessage.includes('not available')) {
          errorMessage = 'Worker not available';
          errorSubText = 'This technician is already assigned to another active campaign or not available during this period.';
        } else if (backendMessage.includes('not found')) {
          errorMessage = 'Campaign or Technician not found';
          errorSubText = 'Please refresh the page and try again.';
        } else {
          errorSubText = backendMessage;
        }
      } else if (error.message === 'Campaign must have vehicles before assigning technician') {
        errorMessage = 'No vehicles in campaign';
        errorSubText = 'Please add vehicles to this campaign first.';
      } else {
        errorSubText = error.message || 'Please try again.';
      }
      
      setNotification({
        type: 'error',
        message: errorMessage,
        subText: errorSubText
      });
    }
  };

  // Handle assign button click
  const handleAssignClick = (campaign) => {
    openAssignModal(campaign);
  };

  // Handle add vehicle button click
  const handleAddVehicleClick = (campaign) => {
    openAddVehicleModal(campaign);
  };

  // Handle add vehicle submit
  const handleAddVehicle = async (campaign, vin) => {
    try {
      console.group('🔵 Adding vehicle to campaign');
      console.log('📋 Campaign ID:', campaign.campaignId);
      console.log('📋 Campaign Name:', campaign.campaignName);
      console.log('📋 Full Campaign:', campaign);
      console.log('🚗 VIN:', vin);
      console.log('🚗 VIN Length:', vin.length);
      console.log('🚗 VIN Type:', typeof vin);
      console.groupEnd();
      
      // Backend expects array of VIN strings: ["VIN1", "VIN2", ...]
      // Based on Swagger docs: Request body = [ "string" ]
      console.log(`🌐 API: POST /campaigns/${campaign.campaignId}/vehicles`);
      console.log(`📦 Body: Array of VINs: ["${vin}"]`);
      
      const response = await axiosInstance.post(
        `/campaigns/${campaign.campaignId}/vehicles`,
        [vin] // Array of VIN strings
      );

      console.log('✅ Add vehicle response:', response);

      closeAddVehicleModal();
      
      setNotification({
        type: 'success',
        message: 'Vehicle added successfully!',
        subText: `VIN ${vin} has been added to ${campaign.campaignName}`
      });

      // Refetch campaigns to get updated vehicle count
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error) {
      console.error("❌ Add vehicle failed:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      setNotification({
        type: 'error',
        message: 'Failed to add vehicle',
        subText: error.response?.data?.message || error.message || 'Please try again or check VIN number.'
      });
    }
  };

  // Show loading state
  if (campaignsLoading || techniciansLoading || vehicleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[30px] font-semibold mb-1">Assign Worker to Campaign</h1>
          <p className="text-xl text-[#929594] font-semibold">Assign technicians to maintenance campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-semibold text-[#393C3B]">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <div className="w-[45px] h-[45px] rounded-full bg-[#F1F3F4] flex items-center justify-center">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
              <path d="M20.3125 3.125H17.9688V2.34375C17.9688 2.13655 17.8864 1.93784 17.7399 1.79132C17.5934 1.64481 17.3947 1.5625 17.1875 1.5625C16.9803 1.5625 16.7816 1.64481 16.6351 1.79132C16.4886 1.93784 16.4062 2.13655 16.4062 2.34375V3.125H8.59375V2.34375C8.59375 2.13655 8.51144 1.93784 8.36493 1.79132C8.21841 1.64481 8.0197 1.5625 7.8125 1.5625C7.6053 1.5625 7.40659 1.64481 7.26007 1.79132C7.11356 1.93784 7.03125 2.13655 7.03125 2.34375V3.125H4.6875C4.2731 3.125 3.87567 3.28962 3.58265 3.58265C3.28962 3.87567 3.125 4.2731 3.125 4.6875V20.3125C3.125 20.7269 3.28962 21.1243 3.58265 21.4174C3.87567 21.7104 4.2731 21.875 4.6875 21.875H20.3125C20.7269 21.875 21.1243 21.7104 21.4174 21.4174C21.7104 21.1243 21.875 20.7269 21.875 20.3125V4.6875C21.875 4.2731 21.7104 3.87567 21.4174 3.58265C21.1243 3.28962 20.7269 3.125 20.3125 3.125ZM7.03125 4.6875V5.46875C7.03125 5.67595 7.11356 5.87466 7.26007 6.02118C7.40659 6.16769 7.6053 6.25 7.8125 6.25C8.0197 6.25 8.21841 6.16769 8.36493 6.02118C8.51144 5.87466 8.59375 5.67595 8.59375 5.46875V4.6875H16.4062V5.46875C16.4062 5.67595 16.4886 5.87466 16.6351 6.02118C16.7816 6.16769 16.9803 6.25 17.1875 6.25C17.3947 6.25 17.5934 6.16769 17.7399 6.02118C17.8864 5.87466 17.9688 5.67595 17.9688 5.46875V4.6875H20.3125V7.8125H4.6875V4.6875H7.03125ZM20.3125 20.3125H4.6875V9.375H20.3125V20.3125Z" fill="black"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatusCard key={index} {...stat} />
        ))}
      </div>

      {/* Campaigns Section */}
      <div className="mb-6">
        <h2 className="text-[25px] font-semibold mb-6">
          Campaigns ({displayCampaigns.length})
        </h2>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Filter Tabs */}
          <FilterTabs
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            getFilterCount={getFilterCount}
          />

          {/* Search */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search campaigns..."
          />
        </div>

        {/* Campaign Cards Grid or Empty State */}
        {displayCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.campaignId}
                campaign={campaign}
                onAssignClick={handleAssignClick}
                onAddVehicleClick={handleAddVehicleClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No Campaigns to Display"
            message={searchTerm ? "Try adjusting your search or filters" : "Campaigns will appear here when available"}
          />
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={closeAddVehicleModal}
        selectedCampaign={selectedCampaignForVehicle}
        onAddVehicle={handleAddVehicle}
        availableVehicles={vehicles}
        vehiclesLoading={vehicleLoading}
      />

      {/* Assign Technician Modal */}
      <CampaignAssignModal
        isOpen={showAssignModal}
        onClose={closeAssignModal}
        selectedCampaign={selectedCampaign}
        availableTechnicians={technicians}
        onAssign={handleAssignTechnician}
      />

      {/* Notifications */}
      {notification?.type === 'success' && (
        <SuccessNotification
          message={notification.message}
          subText={notification.subText}
          onClose={() => setNotification(null)}
        />
      )}
      {notification?.type === 'error' && (
        <ErrorNotification
          message={notification.message}
          subText={notification.subText}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
