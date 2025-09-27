import axios from 'axios';

// Configure base URL - replace with your actual API URL
const API_BASE_URL = 'https://api.example.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    // const token = getAuthToken(); // implement this function
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // logout(); // implement this function
    }
    return Promise.reject(error);
  }
);

// Example API functions
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const propertyService = {
  getProperties: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  
  getProperty: async (id: string) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  createProperty: async (property: any) => {
    const response = await api.post('/properties', property);
    return response.data;
  },
  
  updateProperty: async (id: string, property: any) => {
    const response = await api.put(`/properties/${id}`, property);
    return response.data;
  },
  
  deleteProperty: async (id: string) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },
};
