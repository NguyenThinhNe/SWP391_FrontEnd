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
        
        // 🔍 Debug: Log outgoing requests
        if (config.method?.toUpperCase() === 'PUT' && config.url?.includes('/claims/')) {
            console.log("🚀 [Axios] Sending PUT request to:", config.url);
            console.log("📦 [Axios] Request data:", config.data);
            console.log("🔑 [Axios] Has token:", !!token);
        }
        
        // 🔍 Debug: Log campaign vehicle requests
        if (config.url?.includes('/campaigns/') && config.url?.includes('/vehicles')) {
            console.log("🚀 [Axios] Campaign vehicle request:");
            console.log("   Method:", config.method?.toUpperCase());
            console.log("   Full URL:", config.baseURL + config.url);
            console.log("   Body:", config.data);
            console.log("   Body type:", typeof config.data);
            console.log("   Content-Type:", config.headers["Content-Type"]);
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
        // 🔍 Debug: Log successful responses for PUT requests
        if (response.config?.method?.toUpperCase() === 'PUT' && response.config?.url?.includes('/claims/')) {
            console.log("✅ [Axios] PUT request successful");
            console.log("📥 [Axios] Response status:", response.status);
            console.log("📥 [Axios] Response data:", response.data);
        }
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