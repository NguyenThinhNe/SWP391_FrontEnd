# API Module - Hướng dẫn sử dụng

## Cấu trúc thư mục

```
src/api/
├── axiosConfig.js      # Cấu hình axios instance với interceptors
├── apiService.js       # Service class chứa các method HTTP (GET, POST, PUT, DELETE, etc.)
├── endpoints.js        # Định nghĩa tất cả API endpoints
├── index.js           # Export tất cả services
├── services/          # Các service modules theo domain
│   ├── authService.js
│   ├── userService.js
│   └── warrantyService.js
└── README.md          # File này
```

## Cài đặt

### 1. Cấu hình môi trường

Tạo file `.env` từ `.env.example` và cấu hình API base URL:

```bash
VITE_API_BASE_URL=https://localhost:7001/api
```

### 2. Axios đã được cài đặt sẵn

Kiểm tra trong `package.json`, axios version 1.12.2 đã có sẵn.

## Sử dụng

### Cách 1: Sử dụng Service (Khuyến nghị)

```javascript
import { authService, userService, warrantyService } from '@/api';

// Đăng nhập
const loginUser = async (email, password) => {
  const result = await authService.login({ email, password });
  
  if (result.success) {
    console.log('Login successful:', result.data);
    // Token đã được tự động lưu vào localStorage
  } else {
    console.error('Login failed:', result.error);
  }
};

// Lấy danh sách users
const fetchUsers = async () => {
  const result = await userService.getAllUsers({ page: 1, limit: 10 });
  
  if (result.success) {
    return result.data;
  } else {
    console.error('Error:', result.error);
  }
};

// Lấy profile
const getMyProfile = async () => {
  const result = await userService.getProfile();
  
  if (result.success) {
    return result.data;
  }
};
```

### Cách 2: Sử dụng apiService trực tiếp

```javascript
import { apiService, API_ENDPOINTS } from '@/api';

// GET request
const getData = async () => {
  const result = await apiService.get('/users');
  
  if (result.success) {
    console.log(result.data);
  }
};

// POST request
const createData = async () => {
  const result = await apiService.post('/users', {
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  if (result.success) {
    console.log('Created:', result.data);
  }
};

// PUT request
const updateData = async (id) => {
  const result = await apiService.put(`/users/${id}`, {
    name: 'Jane Doe'
  });
};

// DELETE request
const deleteData = async (id) => {
  const result = await apiService.delete(`/users/${id}`);
};
```

### Cách 3: Sử dụng axios instance trực tiếp

```javascript
import { axiosInstance } from '@/api';

// Sử dụng axios như bình thường
const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/users');
    console.log(response); // Response đã được interceptor xử lý
  } catch (error) {
    console.error(error);
  }
};
```

## Upload File

```javascript
import { apiService } from '@/api';

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const result = await apiService.uploadFile(
    '/upload',
    formData,
    (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload progress: ${percentCompleted}%`);
    }
  );
  
  if (result.success) {
    console.log('File uploaded:', result.data);
  }
};
```

## Download File

```javascript
import { apiService } from '@/api';

const downloadReport = async (reportId) => {
  const result = await apiService.downloadFile(
    `/reports/${reportId}/download`,
    'report.pdf'
  );
  
  if (result.success) {
    console.log('File downloaded successfully');
  }
};
```

## Ví dụ trong React Component

```javascript
import React, { useState, useEffect } from 'react';
import { userService } from '@/api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await userService.getAllUsers({ page: 1, limit: 10 });
    
    if (result.success) {
      setUsers(result.data.items || result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Custom Hook để fetch data

```javascript
// src/hooks/useApi.js
import { useState, useEffect } from 'react';

export const useApi = (apiFunc, params = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    setLoading(true);
    const result = params ? await apiFunc(params) : await apiFunc();
    
    if (result.success) {
      setData(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};

// Sử dụng
import { useApi } from '@/hooks/useApi';
import { userService } from '@/api';

function UserList() {
  const { data: users, loading, error, refetch } = useApi(userService.getAllUsers);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {/* Render users */}
    </div>
  );
}
```

## Tạo Service mới

Để tạo service mới, tạo file trong `src/api/services/`:

```javascript
// src/api/services/taskService.js
import apiService from '../apiService';
import { API_ENDPOINTS } from '../endpoints';

class TaskService {
  async getAllTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.TASKS.GET_ALL}?${queryString}` : API_ENDPOINTS.TASKS.GET_ALL;
    return await apiService.get(url);
  }

  async getTaskById(taskId) {
    return await apiService.get(API_ENDPOINTS.TASKS.GET_BY_ID(taskId));
  }

  async createTask(taskData) {
    return await apiService.post(API_ENDPOINTS.TASKS.CREATE, taskData);
  }

  async updateTask(taskId, taskData) {
    return await apiService.put(API_ENDPOINTS.TASKS.UPDATE(taskId), taskData);
  }

  async deleteTask(taskId) {
    return await apiService.delete(API_ENDPOINTS.TASKS.DELETE(taskId));
  }
}

export default new TaskService();
```

Sau đó export trong `src/api/index.js`:

```javascript
export { default as taskService } from './services/taskService';
```

## Features

### ✅ Auto Authentication
- Tự động thêm Bearer token vào headers
- Tự động refresh token khi hết hạn
- Tự động redirect về login khi unauthorized

### ✅ Error Handling
- Xử lý lỗi tập trung
- Return format nhất quán: `{ success, data, error, details }`
- Easy to display error messages

### ✅ File Upload/Download
- Support upload với progress tracking
- Support download file

### ✅ Flexible
- Có thể dùng service methods (khuyến nghị)
- Có thể dùng apiService trực tiếp
- Có thể dùng axios instance trực tiếp

## Lưu ý

1. **Base URL**: Thay đổi `VITE_API_BASE_URL` trong file `.env` theo môi trường của bạn
2. **Endpoints**: Cập nhật `src/api/endpoints.js` theo cấu trúc API backend của bạn
3. **Token Storage**: Hiện tại sử dụng localStorage, có thể thay bằng sessionStorage hoặc cookie tùy nhu cầu
4. **Response Format**: Interceptor giả định response trả về `response.data`, điều chỉnh nếu backend có format khác

## Tương thích với ASP.NET Web API

Module này được thiết kế tương thích với ASP.NET Web API:

- ✅ Bearer token authentication
- ✅ JSON request/response
- ✅ Standard HTTP status codes
- ✅ File upload/download
- ✅ Query parameters
- ✅ Error handling

Điều chỉnh `endpoints.js` để match với routing của ASP.NET controllers.
