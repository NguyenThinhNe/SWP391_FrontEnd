import apiService from '../apiService';
import { API_ENDPOINTS } from '../endpoints';

/**
 * User Service - Xử lý các API calls liên quan đến users
 */
class UserService {
  /**
   * Lấy danh sách tất cả users
   * @param {object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise}
   */
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.USERS.GET_ALL}?${queryString}` : API_ENDPOINTS.USERS.GET_ALL;
    return await apiService.get(url);
  }

  /**
   * Lấy thông tin user theo ID
   * @param {string|number} userId
   * @returns {Promise}
   */
  async getUserById(userId) {
    return await apiService.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
  }

  /**
   * Tạo user mới
   * @param {object} userData
   * @returns {Promise}
   */
  async createUser(userData) {
    return await apiService.post(API_ENDPOINTS.USERS.CREATE, userData);
  }

  /**
   * Cập nhật thông tin user
   * @param {string|number} userId
   * @param {object} userData
   * @returns {Promise}
   */
  async updateUser(userId, userData) {
    return await apiService.put(API_ENDPOINTS.USERS.UPDATE(userId), userData);
  }

  /**
   * Xóa user
   * @param {string|number} userId
   * @returns {Promise}
   */
  async deleteUser(userId) {
    return await apiService.delete(API_ENDPOINTS.USERS.DELETE(userId));
  }

  /**
   * Lấy profile của user hiện tại
   * @returns {Promise}
   */
  async getProfile() {
    return await apiService.get(API_ENDPOINTS.USERS.GET_PROFILE);
  }

  /**
   * Cập nhật profile của user hiện tại
   * @param {object} profileData
   * @returns {Promise}
   */
  async updateProfile(profileData) {
    return await apiService.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
  }
}

export default new UserService();
