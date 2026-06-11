const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('auth_token');

// Handle 401 responses by clearing stale token and redirecting to login
function handleUnauthorized() {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}

// API client with authentication
export const api = {
  // Auth
  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    if (data.token) localStorage.setItem('auth_token', data.token);
    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    if (data.token) localStorage.setItem('auth_token', data.token);
    return data;
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  // Products
  async getProducts(filters?: { category?: string; minPrice?: number; maxPrice?: number; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    return response.json();
  },

  async getProduct(id: number) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  // Cart
  async getCart() {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (response.status === 401) { handleUnauthorized(); throw new Error('Session expired'); }
    return response.json();
  },

  async addToCart(productId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (response.status === 401) { handleUnauthorized(); throw new Error('Session expired'); }
    return response.json();
  },

  async updateCartItem(itemId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  async removeFromCart(itemId: number) {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  async clearCart() {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  // Orders
  async createOrder() {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  async getOrder(id: number) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  // Chat
  async sendMessage(message: string) {
    const token = getToken();
    if (!token) {
      handleUnauthorized();
      throw new Error('Not authenticated. Please login first.');
    }
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }
    
    return response.json();
  },

  async getChatSessions() {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  async getChatMessages(sessionId: number) {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },
};
