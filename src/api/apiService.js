import axiosInstance from './axiosConfig';

/**
 * Service class để handle các API calls
 */
class ApiService {
  /**
   * GET request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config (optional)
   * @returns {Promise}
   */
  async get(url, config = {}) {
    try {
      const response = await axiosInstance.get(url, config);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }

  /**
   * POST request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {object} config - Axios config (optional)
   * @returns {Promise}
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.post(url, data, config);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }

  /**
   * PUT request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {object} config - Axios config (optional)
   * @returns {Promise}
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.put(url, data, config);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }

  /**
   * PATCH request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {object} config - Axios config (optional)
   * @returns {Promise}
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.patch(url, data, config);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }

  /**
   * DELETE request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config (optional)
   * @returns {Promise}
   */
  async delete(url, config = {}) {
    try {
      const response = await axiosInstance.delete(url, config);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }

  /**
   * Upload file
   * @param {string} url - Endpoint URL
   * @param {FormData} formData - Form data with file
   * @param {function} onUploadProgress - Progress callback
   * @returns {Promise}
   */
  async uploadFile(url, formData, onUploadProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await axiosInstance.post(url, formData, config);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }

  /**
   * Download file
   * @param {string} url - Endpoint URL
   * @param {string} filename - File name to save
   * @returns {Promise}
   */
  async downloadFile(url, filename) {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message, details: error };
    }
  }
}

export default new ApiService();
