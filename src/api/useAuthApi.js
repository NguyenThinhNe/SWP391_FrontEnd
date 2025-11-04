import { useState, useCallback, useEffect } from "react";
import axiosClient from "./axiousInstance";

export const useAuthApi = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const login = useCallback(async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosClient.post("/auth/login", credentials);
            const data = response.data?.data || response.data;
            if (!data || !data.token) throw new Error("Invalid login response");
            localStorage.setItem("token", data.token);
            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            const userData = data.user ? { ...data.user, role: data.user.role || data.role } : { role: data.role, username: data.username || data.userName };
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("authInitialized", "true");
            setUser(userData);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("authInitialized");
        delete axiosClient.defaults.headers.common["Authorization"];
        setUser(null);
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (!token) {
            setLoading(false);
            return;
        }
        
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Parse error:", err);
            }
        }
        
        // Don't check again if already initialized
        const currentInit = localStorage.getItem("authInitialized");
        if (currentInit === "true") {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const response = await axiosClient.get("/auth/me");
            const data = response.data?.data || response.data;
            const userData = data.user ? { ...data.user, role: data.user.role || data.role } : { role: data.role };
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("authInitialized", "true");
            setUser(userData);
        } catch (err) {
            console.error("Auth check failed:", err.response?.status);
            if (err.response?.status === 401) {
                logout();
            } else {
                localStorage.setItem("authInitialized", "true");
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    const validateToken = useCallback(async (token) => {
        try {
            const response = await axiosClient.post("/auth/validate-token", { token });
            return response.data?.isValid || false;
        } catch {
            return false;
        }
    }, []);

    const changePassword = useCallback(async (oldPassword, newPassword) => {
        try {
            setLoading(true);
            const response = await axiosClient.post("/auth/change-password", { oldPassword, newPassword });
            return { success: true, message: response.data?.message || "Password changed" };
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to change password";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialized = localStorage.getItem("authInitialized");
        if (!initialized || initialized !== "true") {
            checkAuth();
        } else {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { user, loading, error, login, logout, checkAuth, validateToken, changePassword };
};
