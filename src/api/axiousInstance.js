import axios from "axios";

// Use proxy in development to avoid CORS, direct URL in production
const getBaseURL = () => {
    // In development with Vite proxy, use relative path
    if (import.meta.env.DEV) {
        return "/api"; // Vite proxy will forward to backend
    }
    // In production, use full URL
    return import.meta.env.VITE_API_BASE_URL || "https://dev-be-wm.hikarimoon.pro/api";
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData, let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        
        // 🔍 Debug: Log outgoing requests (simplified)
        if (config.method?.toUpperCase() === 'PUT' && config.url?.includes('/claims/')) {
            console.log("[Axios] PUT request:", config.url);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional interceptors for auth / errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // 🔍 Debug: Log errors in detail
        if (error.config?.method?.toUpperCase() === 'PUT' && error.config?.url?.includes('/claims/')) {
            console.error("❌ [Axios] PUT request failed");
            console.error("❌ [Axios] Error status:", error.response?.status);
            console.error("❌ [Axios] Error data:", error.response?.data);
            
            // Log validation errors in detail
            if (error.response?.data?.errors) {
                console.error("📋 [Axios] Validation errors:", JSON.stringify(error.response.data.errors, null, 2));
                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                    console.error(`   • ${field}:`, Array.isArray(messages) ? messages.join(', ') : messages);
                });
            }
            
            console.error("❌ [Axios] Error message:", error.message);
        } else if (error.config?.url?.includes('/campaigns/') && error.config?.url?.includes('/technicians/')) {
            // Campaign technician assignment errors
            console.error("❌ [Axios] Technician assignment failed");
            console.error("❌ [Axios] Error status:", error.response?.status);
            console.error("❌ [Axios] Error data:", error.response?.data);
            console.error("❌ [Axios] Error message:", error.response?.data?.message || error.message);
            
            if (error.response?.data?.errors) {
                console.error("📋 [Axios] Validation errors:", error.response.data.errors);
            }
        } else {
            console.error("API Error:", error);
        }
        
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            console.error("🔐 [Axios] 401 Unauthorized - Token expired or invalid");
            console.error("🔐 [Axios] Clearing token and redirecting to login...");
            
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        throw error;
    }
);

export default axiosInstance;
