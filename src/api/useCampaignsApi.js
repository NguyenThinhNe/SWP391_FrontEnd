import { useEffect, useState } from "react";
import axiousInstance from "./axiousInstance";

/**
 * Custom hook for Campaigns management (for SC Technician)
 * Fetches campaigns assigned to a technician
 */
export const useCampaignsApi = (userId) => {
    const [campaigns, setCampaigns] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch all campaigns for a specific technician or service center
     */
    const fetchCampaigns = async (userId) => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log("🔵 [useCampaignsApi] Fetching campaigns...");
            console.log("🔵 [useCampaignsApi] Service Center ID:", userId);

            // Try different endpoints to find active campaigns
            // Option 1: GET /api/campaigns/active
            // Option 2: GET /api/campaigns/service-center/{serviceCenterId}
            // Option 3: GET /api/campaigns (then filter by service center in frontend)
            
            let response;
            let endpointUsed = '';
            
            try {
                // Try active campaigns endpoint first
                console.log("🔍 [useCampaignsApi] Trying: GET /campaigns/active");
                response = await axiousInstance.get('/campaigns/active');
                endpointUsed = '/campaigns/active';
                console.log("✅ [useCampaignsApi] Success with /campaigns/active");
            } catch (err1) {
                console.warn("⚠️ [useCampaignsApi] /campaigns/active failed:", err1.response?.status);
                
                try {
                    // Try service-center endpoint
                    console.log("🔍 [useCampaignsApi] Trying: GET /campaigns/service-center/" + userId);
                    response = await axiousInstance.get(`/campaigns/service-center/${userId}`);
                    endpointUsed = `/campaigns/service-center/${userId}`;
                    console.log("✅ [useCampaignsApi] Success with /campaigns/service-center");
                } catch (err2) {
                    console.warn("⚠️ [useCampaignsApi] /campaigns/service-center failed:", err2.response?.status);
                    
                    // Fallback to get all campaigns
                    console.log("🔍 [useCampaignsApi] Trying: GET /campaigns (fallback)");
                    response = await axiousInstance.get('/campaigns');
                    endpointUsed = '/campaigns';
                    console.log("✅ [useCampaignsApi] Success with /campaigns");
                }
            }
            
            console.log("✅ [useCampaignsApi] Used endpoint:", endpointUsed);
            console.log("📥 [useCampaignsApi] API Response:", response);

            // Handle different response structures
            const data = Array.isArray(response)
                ? response
                : (Array.isArray(response.data) ? response.data : response.data?.data || []);

            if (!Array.isArray(data)) {
                console.warn("⚠️ [useCampaignsApi] Unexpected response structure:", response);
                setCampaigns([]);
                return;
            }

            console.log("📊 [useCampaignsApi] Total campaigns received:", data.length);
            
            // Filter by service center if endpoint didn't filter for us
            // This handles the case where backend returns all campaigns
            let filteredData = data;
            if (endpointUsed === '/campaigns' || endpointUsed === '/campaigns/active') {
                console.log("🔍 [useCampaignsApi] Filtering campaigns by service center:", userId);
                filteredData = data.filter(camp => {
                    // Check if campaign belongs to this service center
                    // Backend might store it in different fields
                    const campServiceCenter = camp.serviceCenterId || camp.serviceCenterID || 
                                             camp.service_center_id || camp.ServiceCenterId;
                    
                    console.log(`  - Campaign "${camp.campaignName || camp.name}": serviceCenterId =`, campServiceCenter);
                    
                    // If no service center ID in campaign, include it (might be handled differently)
                    if (!campServiceCenter) {
                        console.log(`    ⚠️ No serviceCenterId found, including campaign`);
                        return true;
                    }
                    
                    return campServiceCenter === userId;
                });
                console.log("📊 [useCampaignsApi] Campaigns after filtering:", filteredData.length);
            }

            // Format campaigns data
            const formattedCampaigns = filteredData.map((camp, index) => {
                console.log(`🔍 [DEBUG ${index + 1}/${filteredData.length}] Raw campaign:`, {
                    id: camp.campaignId || camp.id,
                    name: camp.campaignName || camp.name,
                    serviceCenterId: camp.serviceCenterId || camp.serviceCenterID || camp.service_center_id,
                    status: camp.status,
                    vehicles: camp.vehicles?.length || camp.vehicleCount || 0
                });
                
                return {
                    campaignId: camp.campaignId || camp.id,
                    campaignName: camp.campaignName || camp.name || "Unknown Campaign",
                    description: camp.description || "",
                    status: camp.status || 0,
                    statusDisplay: getCampaignStatusLabel(camp.status),
                    startDate: camp.startDate ? new Date(camp.startDate).toLocaleDateString() : "N/A",
                    endDate: camp.endDate ? new Date(camp.endDate).toLocaleDateString() : "N/A",
                    technicianId: camp.technicianId,
                    technicianName: camp.technicianName || "Unassigned",
                    vehicleCount: camp.vehicleCount || camp.vehicles?.length || 0,
                    vehicles: camp.vehicles || [],
                    serviceCenterId: camp.serviceCenterId,
                    serviceCenterName: camp.serviceCenterName || "",
                    createdAt: camp.createdAt,
                    updatedAt: camp.updatedAt,
                };
            });

            console.log("✅ [useCampaignsApi] Formatted campaigns:", formattedCampaigns);
            console.log("📊 [useCampaignsApi] Summary:");
            console.log(`   - Endpoint used: ${endpointUsed}`);
            console.log(`   - Total received: ${data.length}`);
            console.log(`   - After filtering: ${filteredData.length}`);
            console.log(`   - Final formatted: ${formattedCampaigns.length}`);
            console.log(`   - Service Center ID: ${userId}`);
            
            setCampaigns(formattedCampaigns);
        } catch (err) {
            console.error("❌ [useCampaignsApi] Fetch campaigns failed:", err);
            setError(err);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch a single campaign by ID
     */
    const fetchCampaignById = async (id) => {
        try {
            setLoading(true);
            setError(null);

            console.log("🔵 [useCampaignsApi] Fetching campaign by ID:", id);
            console.log("🔵 [useCampaignsApi] Endpoint: GET /campaigns/" + id);

            let response;
            try {
                response = await axiousInstance.get(`/campaigns/${id}`);
                console.log("✅ [useCampaignsApi] Campaign fetched successfully");
            } catch (err) {
                if (err.response?.status === 404) {
                    console.error("❌ [useCampaignsApi] Endpoint /campaigns/:id not found (404)");
                    console.error("❌ [useCampaignsApi] Backend endpoint does not exist yet");
                    throw new Error("API endpoint /campaigns/:id not found. Please check with backend team.");
                }
                throw err;
            }

            const camp = response?.data || response;

            if (!camp) {
                throw new Error("Campaign not found");
            }

            console.log("📥 [useCampaignsApi] Campaign data:", camp);

            const formattedCampaign = {
                campaignId: camp.campaignId || camp.id,
                campaignName: camp.campaignName || camp.name || "Unknown Campaign",
                description: camp.description || "",
                status: camp.status || 0,
                statusDisplay: getCampaignStatusLabel(camp.status),
                startDate: camp.startDate ? new Date(camp.startDate).toLocaleDateString() : "N/A",
                endDate: camp.endDate ? new Date(camp.endDate).toLocaleDateString() : "N/A",
                technicianId: camp.technicianId,
                technicianName: camp.technicianName || "Unassigned",
                vehicleCount: camp.vehicleCount || camp.vehicles?.length || 0,
                vehicles: camp.vehicles || [],
                serviceCenterId: camp.serviceCenterId,
                serviceCenterName: camp.serviceCenterName || "",
                createdAt: camp.createdAt,
                updatedAt: camp.updatedAt,
            };

            setCampaign(formattedCampaign);
            console.log("✅ [useCampaignsApi] Campaign fetched:", formattedCampaign);
        } catch (err) {
            console.error("❌ [useCampaignsApi] Fetch campaign by ID failed:", err);
            setError(err);
            setCampaign(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update campaign status
     */
    const updateCampaignStatus = async (id, status) => {
        try {
            setLoading(true);
            // Backend expects numeric enum value (0=Pending, 1=InProgress, 2=Completed, 3=Overdue)
            // Send as raw JSON number so backend can bind directly to CampaignStatus enum
            const statusNumber = typeof status === 'number' ? status : parseInt(status, 10);
            const rawBody = JSON.stringify(statusNumber);
            await axiousInstance.patch(`/campaigns/${id}/status`, rawBody, {
                headers: { 'Content-Type': 'application/json' },
            });
            
            // Refetch campaigns after update
            if (userId) {
                await fetchCampaigns(userId);
            }
            
            return { success: true };
        } catch (err) {
            console.error("❌ [useCampaignsApi] Update campaign status failed:", err);
            setError(err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchCampaigns(userId);
        }
    }, [userId]);

    return {
        campaigns,
        campaign,
        loading,
        error,
        fetchCampaigns,
        fetchCampaignById,
        updateCampaignStatus,
        refetch: () => fetchCampaigns(userId),
    };
};

/**
 * Helper function to get campaign status label
 * Backend status: 0=Pending (Awaiting start), 1=Completed (Finished), 2=Active (Currently running)
 */
const getCampaignStatusLabel = (statusCode) => {
    const statusMap = {
        0: "Pending",
        1: "Completed",
        2: "Active",
    };
    return statusMap[statusCode] || "Unknown";
};

