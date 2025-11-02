import { useState, useEffect } from "react";
import axiosInstance from "./axiousInstance";

export const useAdminApi = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalServiceCenters: 0,
        totalPolicies: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/users");
            
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.items || [];

            if (!Array.isArray(data)) {
                console.warn("Unexpected response structure:", response.data);
                setUsers([]);
                return;
            }

            setUsers(data);
            
            // Calculate stats from users data
            const activeCount = data.filter(u => u.status === "Active" || u.isActive).length;
            const inactiveCount = data.filter(u => u.status === "Inactive" || !u.isActive).length;
            
            setStats(prev => ({
                ...prev,
                totalUsers: data.length,
                activeUsers: activeCount,
                inactiveUsers: inactiveCount
            }));
        } catch (err) {
            console.error("Fetch users failed:", err);
            setError(err);
            // Fallback mock data
            setUsers([
                { id: 'USR-001', name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15' },
                { id: 'USR-002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'SC Staff', status: 'Active', joinDate: '2024-02-20' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch dashboard stats
    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get("/admin/stats");
            const data = response.data?.data || response.data;
            
            setStats({
                totalUsers: data.totalUsers || 0,
                activeUsers: data.activeUsers || 0,
                inactiveUsers: data.inactiveUsers || 0,
                totalServiceCenters: data.totalServiceCenters || data.serviceCenters || 0,
                totalPolicies: data.totalPolicies || data.policies || 0
            });
        } catch (err) {
            console.error("Fetch stats failed:", err);
            // Stats will be calculated from users data in fetchUsers
        }
    };

    // Create new user
    const createUser = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.post("/users", userData);
            await fetchUsers();
            return { success: true, message: "User created successfully" };
        } catch (err) {
            console.error("Create user failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update user
    const updateUser = async (userId, userData) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.put(`/users/${userId}`, userData);
            await fetchUsers();
            return { success: true, message: "User updated successfully" };
        } catch (err) {
            console.error("Update user failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const deleteUser = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            await axiosInstance.delete(`/users/${userId}`);
            await fetchUsers();
            return { success: true, message: "User deleted successfully" };
        } catch (err) {
            console.error("Delete user failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get user by ID
    const getUserById = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/users/${userId}`);
            return response.data?.data || response.data;
        } catch (err) {
            console.error("Get user failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    return {
        users,
        stats,
        loading,
        error,
        fetchUsers,
        fetchStats,
        createUser,
        updateUser,
        deleteUser,
        getUserById
    };
};
