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

            let response;
            let endpointUsed = '';
            
            try {
                response = await axiousInstance.get('/campaigns/active');
                endpointUsed = '/campaigns/active';
            } catch (err1) {
                try {
                    response = await axiousInstance.get(`/campaigns/service-center/${userId}`);
                    endpointUsed = `/campaigns/service-center/${userId}`;
                } catch (err2) {
                    response = await axiousInstance.get('/campaigns');
                    endpointUsed = '/campaigns';
                }
            }

            const data = Array.isArray(response)
                ? response
                : (Array.isArray(response.data) ? response.data : response.data?.data || []);

            if (!Array.isArray(data)) {
                setCampaigns([]);
                return;
            }

            const plainData = JSON.parse(JSON.stringify(data));
            
            let filteredData = plainData;
            if (endpointUsed === '/campaigns' || endpointUsed === '/campaigns/active') {
                filteredData = plainData.filter(camp => {
                    const campServiceCenter = camp.serviceCenterId || camp.serviceCenterID || 
                                             camp.service_center_id || camp.ServiceCenterId;
                    
                    if (!campServiceCenter) {
                        return true;
                    }
                    
                    return campServiceCenter === userId;
                });
            }

            const formattedCampaigns = filteredData.map((camp) => {
                const plainCamp = JSON.parse(JSON.stringify(camp));

                const technicianEntries = Array.isArray(plainCamp.campaignTechnicians)
                    ? plainCamp.campaignTechnicians
                    : Array.isArray(plainCamp.technicians)
                      ? plainCamp.technicians
                      : [];

                const firstTechnicianEntry = technicianEntries.length > 0 ? technicianEntries[0] : null;
                const nestedTechnician = firstTechnicianEntry?.technician || firstTechnicianEntry?.technicianInfo || null;

                const technicianInfo =
                    plainCamp.technician ||
                    plainCamp.assignedTechnician ||
                    plainCamp.technicianResponse ||
                    plainCamp.technicianDto ||
                    nestedTechnician ||
                    firstTechnicianEntry ||
                    null;

                const technicianId =
                    plainCamp.technicianId ||
                    plainCamp.technicianID ||
                    plainCamp.TechnicianId ||
                    plainCamp.TechnicianID ||
                    plainCamp.assignedTechnicianId ||
                    plainCamp.assignedTechnicianID ||
                    plainCamp.campaignTechnicianId ||
                    firstTechnicianEntry?.technicianId ||
                    firstTechnicianEntry?.technicianID ||
                    technicianInfo?.id ||
                    technicianInfo?.userId ||
                    technicianInfo?.technicianId ||
                    technicianInfo?.technicianID ||
                    null;

                const technicianNameRaw =
                    plainCamp.technicianName ||
                    plainCamp.TechnicianName ||
                    plainCamp.assignedTechnicianName ||
                    plainCamp.technicianFullName ||
                    plainCamp.techName ||
                    technicianInfo?.name ||
                    technicianInfo?.fullName ||
                    technicianInfo?.displayName ||
                    technicianInfo?.userName ||
                    technicianInfo?.username ||
                    null;

                const rawStatus =
                    plainCamp.status ??
                    plainCamp.statusCode ??
                    plainCamp.campaignStatus ??
                    plainCamp.statusEnum ??
                    plainCamp.statusId ??
                    plainCamp.Status;

                const normalizedStatus = normalizeStatus(rawStatus);
                const statusValue = typeof normalizedStatus === "number" ? normalizedStatus : 0;
                const statusDisplay =
                    typeof normalizedStatus === "number"
                        ? getCampaignStatusLabel(statusValue)
                        : normalizedStatus || "Unknown";

                const vehiclesRaw =
                    plainCamp.vehicles ||
                    plainCamp.vehicleDtos ||
                    plainCamp.vehicleResponses ||
                    plainCamp.campaignVehicles ||
                    [];
                const vehiclesList = Array.isArray(vehiclesRaw) ? vehiclesRaw : [];

                const serviceCenterId =
                    plainCamp.serviceCenterId ||
                    plainCamp.serviceCenterID ||
                    plainCamp.service_center_id ||
                    plainCamp.ServiceCenterId ||
                    plainCamp.serviceCenter?.id ||
                    plainCamp.serviceCenter?.serviceCenterId ||
                    null;

                return {
                    campaignId: plainCamp.campaignId || plainCamp.id,
                    campaignName: plainCamp.campaignName || plainCamp.name || plainCamp.title || "Unknown Campaign",
                    description: plainCamp.description || plainCamp.summary || "",
                    status: statusValue,
                    statusDisplay,
                    startDate: formatDate(plainCamp.startDate || plainCamp.start_time || plainCamp.startDateTime),
                    endDate: formatDate(plainCamp.endDate || plainCamp.end_time || plainCamp.endDateTime),
                    technicianId,
                    technicianName: technicianId ? technicianNameRaw || "Unassigned" : "Unassigned",
                    vehicleCount:
                        typeof plainCamp.vehicleCount === "number"
                            ? plainCamp.vehicleCount
                            : vehiclesList.length,
                    vehicles: vehiclesList,
                    serviceCenterId,
                    serviceCenterName:
                        plainCamp.serviceCenterName ||
                        plainCamp.ServiceCenterName ||
                        plainCamp.serviceCenter?.name ||
                        plainCamp.serviceCenter?.displayName ||
                        "",
                    createdAt: plainCamp.createdAt || plainCamp.created_at,
                    updatedAt: plainCamp.updatedAt || plainCamp.updated_at,
                };
            });
            
            setCampaigns(formattedCampaigns);
        } catch (err) {
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

            const response = await axiousInstance.get(`/campaigns/${id}`);
            const camp = response?.data || response;

            if (!camp) {
                throw new Error("Campaign not found");
            }

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
        } catch (err) {
            setError(err);
            setCampaign(null);
        } finally {
            setLoading(false);
        }
    };

    const applyCampaignTechnicianUpdate = (id, technician) => {
        setCampaigns((prevCampaigns) =>
            prevCampaigns.map((item) =>
                item.campaignId === id
                    ? {
                          ...item,
                          technicianId:
                              technician?.id ||
                              technician?.technicianId ||
                              technician?.technicianID ||
                              technician?.userId ||
                              null,
                          technicianName:
                              technician?.name ||
                              technician?.fullName ||
                              technician?.displayName ||
                              technician?.userName ||
                              technician?.username ||
                              "Unassigned",
                      }
                    : item,
            ),
        );
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
        applyCampaignTechnicianUpdate,
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

function normalizeStatus(status) {
    if (status === null || status === undefined) {
        return 0;
    }

    if (typeof status === "number" && !Number.isNaN(status)) {
        return status;
    }

    if (typeof status === "string") {
        const trimmed = status.trim();

        if (/^-?\d+$/.test(trimmed)) {
            const numericValue = Number(trimmed);
            return Number.isNaN(numericValue) ? 0 : numericValue;
        }

        const normalized = trimmed.toLowerCase();

        switch (normalized) {
            case "pending":
                return 0;
            case "inprogress":
            case "in progress":
            case "ongoing":
            case "active":
                return 2;
            case "completed":
            case "complete":
            case "done":
                return 1;
            case "overdue":
            case "late":
                return 3;
            default:
                return trimmed;
        }
    }

    return 0;
}

function formatDate(value) {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return typeof value === "string" ? value : "N/A";
    }

    return date.toLocaleDateString();
}

