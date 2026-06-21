const API_BASE_URL = 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // If it's a validation error with details
    if (data.error === 'Validation failed' && data.details) {
      const fieldErrors = data.details.map(d => `${d.field}: ${d.message}`).join(', ');
      throw new Error(`Validation failed: ${fieldErrors}`);
    }
    throw new Error(data.error || 'Request failed. Please try again.');
  }
  return data.data; // Note backend nests success data in a "data" wrapper
};

export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// API routes mapped to actions
export const api = {
  auth: {
    login: (credentials) => apiCall('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => apiCall('/auth/register', { method: 'POST', body: userData }),
  },
  users: {
    getMe: () => apiCall('/users/me', { method: 'GET' }),
    listAll: () => apiCall('/users', { method: 'GET' }),
    update: (id, updates) => apiCall(`/users/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
  },
  records: {
    list: (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return apiCall(`/records${queryString}`, { method: 'GET' });
    },
    getById: (id) => apiCall(`/records/${id}`, { method: 'GET' }),
    create: (recordData) => apiCall('/records', { method: 'POST', body: recordData }),
    update: (id, recordData) => apiCall(`/records/${id}`, { method: 'PATCH', body: recordData }),
    delete: (id) => apiCall(`/records/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    getFull: (filters = {}) => {
      const queryParams = new URLSearchParams();
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return apiCall(`/dashboard${queryString}`, { method: 'GET' });
    },
    getSummary: (filters = {}) => {
      const queryParams = new URLSearchParams();
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return apiCall(`/dashboard/summary${queryString}`, { method: 'GET' });
    },
    getCategories: (filters = {}) => {
      const queryParams = new URLSearchParams();
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);
      if (filters.type) queryParams.append('type', filters.type);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return apiCall(`/dashboard/categories${queryString}`, { method: 'GET' });
    },
    getTrends: (months = 6) => apiCall(`/dashboard/trends?months=${months}`, { method: 'GET' }),
    getRecent: (limit = 10) => apiCall(`/dashboard/recent?limit=${limit}`, { method: 'GET' }),
  },
};
