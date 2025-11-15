const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // User API methods
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Roles API methods
  async getRoles() {
    return this.request('/roles');
  }

  async getRoleById(id) {
    return this.request(`/roles/${id}`);
  }

  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id, roleData) {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id) {
    return this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth API methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}

export default new ApiService();

