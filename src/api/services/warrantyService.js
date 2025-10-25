import apiService from '../apiService';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Warranty Service - Xử lý các API calls liên quan đến warranties
 */
class WarrantyService {
  /**
   * Lấy danh sách tất cả warranties
   * @param {object} params - Query parameters
   * @returns {Promise}
   */
  async getAllWarranties(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.WARRANTY.GET_ALL}?${queryString}` : API_ENDPOINTS.WARRANTY.GET_ALL;
    return await apiService.get(url);
  }

  /**
   * Lấy thông tin warranty theo ID
   * @param {string|number} warrantyId
   * @returns {Promise}
   */
  async getWarrantyById(warrantyId) {
    return await apiService.get(API_ENDPOINTS.WARRANTY.GET_BY_ID(warrantyId));
  }

  /**
   * Tạo warranty mới
   * @param {object} warrantyData
   * @returns {Promise}
   */
  async createWarranty(warrantyData) {
    return await apiService.post(API_ENDPOINTS.WARRANTY.CREATE, warrantyData);
  }

  /**
   * Cập nhật thông tin warranty
   * @param {string|number} warrantyId
   * @param {object} warrantyData
   * @returns {Promise}
   */
  async updateWarranty(warrantyId, warrantyData) {
    return await apiService.put(API_ENDPOINTS.WARRANTY.UPDATE(warrantyId), warrantyData);
  }

  /**
   * Xóa warranty
   * @param {string|number} warrantyId
   * @returns {Promise}
   */
  async deleteWarranty(warrantyId) {
    return await apiService.delete(API_ENDPOINTS.WARRANTY.DELETE(warrantyId));
  }

  /**
   * Lấy báo cáo warranty
   * @param {object} params - Query parameters
   * @returns {Promise}
   */
  async getWarrantyReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.WARRANTY.GET_REPORTS}?${queryString}` : API_ENDPOINTS.WARRANTY.GET_REPORTS;
    return await apiService.get(url);
  }
}

export default new WarrantyService();
