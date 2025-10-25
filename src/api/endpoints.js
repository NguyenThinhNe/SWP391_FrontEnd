/**
 * Định nghĩa các endpoints cho API
 * Thay đổi theo cấu trúc API của ASP.NET Web API backend
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User endpoints
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },

  // Warranty endpoints
  WARRANTY: {
    GET_ALL: '/warranties',
    GET_BY_ID: (id) => `/warranties/${id}`,
    CREATE: '/warranties',
    UPDATE: (id) => `/warranties/${id}`,
    DELETE: (id) => `/warranties/${id}`,
    GET_REPORTS: '/warranties/reports',
  },

  // Claim Request endpoints
  CLAIMS: {
    GET_ALL: '/claims',
    GET_BY_ID: (id) => `/claims/${id}`,
    CREATE: '/claims',
    UPDATE: (id) => `/claims/${id}`,
    DELETE: (id) => `/claims/${id}`,
    ASSIGN_WORKER: (id) => `/claims/${id}/assign`,
  },

  // Task endpoints
  TASKS: {
    GET_ALL: '/tasks',
    GET_BY_ID: (id) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id) => `/tasks/${id}`,
    DELETE: (id) => `/tasks/${id}`,
    GET_BY_TECHNICIAN: (technicianId) => `/tasks/technician/${technicianId}`,
  },

  // Part Request endpoints
  PARTS: {
    GET_ALL: '/parts',
    GET_BY_ID: (id) => `/parts/${id}`,
    CREATE: '/parts',
    UPDATE: (id) => `/parts/${id}`,
    DELETE: (id) => `/parts/${id}`,
  },

  // Policy endpoints
  POLICIES: {
    GET_ALL: '/policies',
    GET_BY_ID: (id) => `/policies/${id}`,
    CREATE: '/policies',
    UPDATE: (id) => `/policies/${id}`,
    DELETE: (id) => `/policies/${id}`,
  },

  // Campaign endpoints
  CAMPAIGNS: {
    GET_ALL: '/campaigns',
    GET_BY_ID: (id) => `/campaigns/${id}`,
    CREATE: '/campaigns',
    UPDATE: (id) => `/campaigns/${id}`,
    DELETE: (id) => `/campaigns/${id}`,
  },

  // Dashboard endpoints
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    SC_STAFF: '/dashboard/sc-staff',
    SC_TECHNICIAN: '/dashboard/sc-technician',
    EVM_STAFF: '/dashboard/evm-staff',
  },

  // Report endpoints
  REPORTS: {
    GET_ALL: '/reports',
    GENERATE: '/reports/generate',
    EXPORT: '/reports/export',
  },
};
