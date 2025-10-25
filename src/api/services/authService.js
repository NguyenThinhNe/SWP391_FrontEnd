import apiService from '../apiService';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Auth Service - Xử lý các API calls liên quan đến authentication
 */
class AuthService {
  /**
   * Đăng nhập
   * @param {object} credentials - {email, password}
   * @returns {Promise}
   */
  async login(credentials) {
    const result = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (result.success && result.data) {
      // Lưu token vào localStorage
      if (result.data.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
      }
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      if (result.data.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
    }
    
    return result;
  }

  /**
   * Đăng ký
   * @param {object} userData - Thông tin đăng ký
   * @returns {Promise}
   */
  async register(userData) {
    return await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  /**
   * Đăng xuất
   * @returns {Promise}
   */
  async logout() {
    const result = await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Xóa token khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return result;
  }

  /**
   * Refresh token
   * @returns {Promise}
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token found' };
    }

    const result = await apiService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });

    if (result.success && result.data?.accessToken) {
      localStorage.setItem('accessToken', result.data.accessToken);
    }

    return result;
  }

  /**
   * Quên mật khẩu
   * @param {string} email
   * @returns {Promise}
   */
  async forgotPassword(email) {
    return await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  /**
   * Reset mật khẩu
   * @param {object} data - {token, newPassword}
   * @returns {Promise}
   */
  async resetPassword(data) {
    return await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  /**
   * Đổi mật khẩu
   * @param {object} data - {currentPassword, newPassword}
   * @returns {Promise}
   */
  async changePassword(data) {
    return await apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  /**
   * Kiểm tra đã đăng nhập
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Lấy thông tin user hiện tại
   * @returns {object|null}
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Lấy access token
   * @returns {string|null}
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }
}

export default new AuthService();
