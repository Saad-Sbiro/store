// ─────────────────────────────────────────────
// FILE: src/services/api.js
// ─────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

/**
 * Helper to build headers with token if present
 */
function getHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...extraHeaders,
  };

  const token = localStorage.getItem('voidstore_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle HTTP response and throw errors if non-2xx
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || 'Something went wrong';
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Maps database model attributes to camelCase for the frontend
 */
function mapProduct(p) {
  if (!p) return p;
  return {
    ...p,
    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
    reviewCount: p.review_count || 0,
    isFeatured: p.is_featured || false,
    isActive: p.is_active || false,
    category: typeof p.category === 'object' && p.category ? p.category.name : p.category,
    price: parseFloat(p.price),
    rating: parseFloat(p.rating || 0),
  };
}

export const api = {
  // ── Products ──
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });

    const url = `${API_BASE_URL}/products?${query.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    const json = await handleResponse(res);
    
    // Support Laravel pagination structure
    if (json && json.data) {
      return {
        ...json,
        data: json.data.map(mapProduct)
      };
    }
    
    // Support simple array response fallback
    if (Array.isArray(json)) {
      return json.map(mapProduct);
    }
    
    return json;
  },

  async getProduct(idOrSlug) {
    const res = await fetch(`${API_BASE_URL}/products/${idOrSlug}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    
    if (data && data.product) {
      data.product = mapProduct(data.product);
    }
    if (data && data.related) {
      data.related = data.related.map(mapProduct);
    }
    
    return data;
  },

  // ── Categories ──
  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },

  async updateCategory(id, categoryData) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Authentication ──
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.access_token) {
      localStorage.setItem('voidstore_token', data.access_token);
      localStorage.setItem('voidstore_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, email, password, passwordConfirmation) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });
    const data = await handleResponse(res);
    if (data.access_token) {
      localStorage.setItem('voidstore_token', data.access_token);
      localStorage.setItem('voidstore_user', JSON.stringify(data.user));
    }
    return data;
  },

  async logout() {
    try {
      const res = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
      await handleResponse(res);
    } catch (err) {
      console.error('Logout request failed, cleaning local storage anyway.', err);
    } finally {
      localStorage.removeItem('voidstore_token');
      localStorage.removeItem('voidstore_user');
    }
  },

  async getMe() {
    const token = localStorage.getItem('voidstore_token');
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (err) {
      // Token is invalid/expired
      localStorage.removeItem('voidstore_token');
      localStorage.removeItem('voidstore_user');
      throw err;
    }
  },

  // ── Orders ──
  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: status.toLowerCase() }),
    });
    return handleResponse(res);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Admin ──
  async getAdminDashboard() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getHeaders();
    delete headers['Content-Type']; // Let browser set boundary
    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  // ── Analytics ──
  async logEvent(eventType, page = null, productId = null, metadata = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/log`, {
        method: 'POST',
        headers: getHeaders(),
        keepalive: true,
        body: JSON.stringify({
          event_type: eventType,
          page: page || window.location.pathname,
          product_id: productId,
          time_spent: metadata.timeSpent ?? metadata.time_spent ?? null,
          metadata,
          referrer: document.referrer || null,
        }),
      });
      return await handleResponse(res);
    } catch (err) {
      // Fail silently to not disrupt user experience
      console.warn('Analytics log failed:', err.message);
      return null;
    }
  },
};
