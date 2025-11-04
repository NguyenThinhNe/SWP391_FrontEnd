import { useState } from "react";
import axiosInstance from "./axiousInstance";

export const useSCStaffApi = () => {
    const [claims, setClaims] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [parts, setParts] = useState([]);
    const [bills, setBills] = useState([]);
    const [stats, setStats] = useState({
        totalClaims: 0,
        pendingClaims: 0,
        inProgressClaims: 0,
        completedClaims: 0,
        totalWorkOrders: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all warranty claims
    const fetchClaims = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/claims");
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.items || [];

            if (!Array.isArray(data)) {
                console.warn("Unexpected claims response:", response.data);
                setClaims([]);
                return;
            }

            setClaims(data);
            
            // Calculate stats
            const pending = data.filter(c => c.status === "Pending" || c.claimStatus === 0).length;
            const inProgress = data.filter(c => c.status === "In Progress" || c.claimStatus === 1).length;
            const completed = data.filter(c => c.status === "Completed" || c.claimStatus === 2).length;
            
            setStats(prev => ({
                ...prev,
                totalClaims: data.length,
                pendingClaims: pending,
                inProgressClaims: inProgress,
                completedClaims: completed
            }));
        } catch (err) {
            console.error("Fetch claims failed:", err);
            setError(err);
            
            // Fallback to mock data if endpoint doesn't exist
            const mockClaims = [
                { id: 'CLM-001', vehicleId: 'VH-001', customerName: 'John Doe', issue: 'Engine problem', status: 'Pending', claimStatus: 0, createdAt: '2024-11-01' },
                { id: 'CLM-002', vehicleId: 'VH-002', customerName: 'Jane Smith', issue: 'Battery issue', status: 'In Progress', claimStatus: 1, createdAt: '2024-11-02' },
                { id: 'CLM-003', vehicleId: 'VH-003', customerName: 'Bob Wilson', issue: 'Brake system', status: 'Completed', claimStatus: 2, createdAt: '2024-11-03' },
                { id: 'CLM-004', vehicleId: 'VH-004', customerName: 'Alice Brown', issue: 'Transmission', status: 'Pending', claimStatus: 0, createdAt: '2024-11-04' },
            ];
            
            setClaims(mockClaims);
            setStats({
                totalClaims: 4,
                pendingClaims: 2,
                inProgressClaims: 1,
                completedClaims: 1,
                totalWorkOrders: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch claim by ID - using GET /api/claims/{claimId}
    const fetchClaimById = async (claimId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/claims/${claimId}`);
            return response.data?.data || response.data;
        } catch (err) {
            console.error("Fetch claim by ID failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch claims by service center - using GET /api/claims/service-center/{serviceCenterId}
    const fetchClaimsByServiceCenter = async (serviceCenterId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/claims/service-center/${serviceCenterId}`);
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setClaims(data);
            return data;
        } catch (err) {
            console.error("Fetch claims by service center failed:", err);
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Fetch claims by user - using GET /api/claims/user/{userId}
    const fetchClaimsByUser = async (userId) => {
        try {
            const response = await axiosInstance.get(`/claims/user/${userId}`);
            return Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
        } catch (err) {
            console.error("Fetch claims by user failed:", err);
            return [];
        }
    };

    // Fetch claims by status - using GET /api/claims/status/{status}
    const fetchClaimsByStatus = async (status) => {
        try {
            const response = await axiosInstance.get(`/claims/status/${status}`);
            return Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
        } catch (err) {
            console.error("Fetch claims by status failed:", err);
            return [];
        }
    };

    // Update claim - using PUT /api/claims/{claimId}
    const updateClaim = async (claimId, claimData) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.put(`/claims/${claimId}`, claimData);
            await fetchClaims();
            return { success: true, message: "Claim updated successfully" };
        } catch (err) {
            console.error("Update claim failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Approve claim - using PUT /api/claims/{claimId}/approve
    const approveClaim = async (claimId) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.put(`/claims/${claimId}/approve`);
            await fetchClaims();
            return { success: true, message: "Claim approved successfully" };
        } catch (err) {
            console.error("Approve claim failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Reject claim - using PUT /api/claims/{claimId}/reject
    const rejectClaim = async (claimId) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.put(`/claims/${claimId}/reject`);
            await fetchClaims();
            return { success: true, message: "Claim rejected successfully" };
        } catch (err) {
            console.error("Reject claim failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/work-orders");
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.items || [];

            if (!Array.isArray(data)) {
                console.warn("Unexpected work orders response:", response.data);
                setWorkOrders([]);
                return;
            }

            setWorkOrders(data);
            setStats(prev => ({
                ...prev,
                totalWorkOrders: data.length
            }));
        } catch (err) {
            console.error("Fetch work orders failed:", err);
            setError(err);
            setWorkOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available technicians
    const fetchTechnicians = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/technicians");
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.items || [];

            setTechnicians(data);
        } catch (err) {
            console.error("Fetch technicians failed:", err);
            setError(err);
            setTechnicians([]);
        } finally {
            setLoading(false);
        }
    };

    // Assign technician to work order
    const assignTechnician = async (workOrderId, technicianId) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.post(`/work-orders/${workOrderId}/assign`, {
                technicianId
            });
            await fetchWorkOrders(); // Refresh work orders
            return { success: true, message: "Technician assigned successfully" };
        } catch (err) {
            console.error("Assign technician failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch parts requests
    const fetchParts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/parts-requests");
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.items || [];

            setParts(data);
        } catch (err) {
            console.error("Fetch parts failed:", err);
            setError(err);
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    // Create parts request
    const createPartRequest = async (partData) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.post("/parts-requests", partData);
            await fetchParts();
            return { success: true, message: "Part request created successfully" };
        } catch (err) {
            console.error("Create part request failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch bills
    const fetchBills = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/bills");
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.items || [];

            setBills(data);
        } catch (err) {
            console.error("Fetch bills failed:", err);
            setError(err);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    // Create bill
    const createBill = async (billData) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.post("/bills", billData);
            await fetchBills();
            return { success: true, message: "Bill created successfully" };
        } catch (err) {
            console.error("Create bill failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update claim status - using PUT /api/claims/{claimId}/status
    const updateClaimStatus = async (claimId, status) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.put(`/claims/${claimId}/status`, { status });
            await fetchClaims();
            return { success: true, message: "Claim status updated successfully" };
        } catch (err) {
            console.error("Update claim status failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        // Data
        claims,
        workOrders,
        technicians,
        parts,
        bills,
        stats,
        loading,
        error,
        
        // Methods
        fetchClaims,
        fetchClaimById,
        fetchClaimsByServiceCenter,
        fetchClaimsByUser,
        fetchClaimsByStatus,
        updateClaim,
        approveClaim,
        rejectClaim,
        fetchWorkOrders,
        fetchTechnicians,
        assignTechnician,
        fetchParts,
        createPartRequest,
        fetchBills,
        createBill,
        updateClaimStatus
    };
};
