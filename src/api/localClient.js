// Client API pentru serverul local
// Pe Vercel: /api (relative path)
// Local: http://localhost:3001/api
const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api');

// Helper pentru localStorage
const storage = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  getUser: () => {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('current_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('current_user'),
};

const isBrowser = typeof window !== 'undefined';
const CHECKINS_STORAGE_KEY = 'local_checkins_v1';
const WEIGHT_STORAGE_KEY = 'local_weights_v1';

const readStored = (key, fallback = []) => {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn('⚠️ storage read failed for', key, error);
    return fallback;
  }
};

const writeStored = (key, value) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('⚠️ storage write failed for', key, error);
  }
};

// Helper pentru request-uri
async function request(endpoint, options = {}) {
  const token = storage.getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

// API Client
export const localApi = {
  // Auth
  auth: {
    register: async (email, password, first_name, last_name, phone, country_code, country, city, date_of_birth) => {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          first_name,
          last_name,
          phone, 
          country_code, 
          country, 
          city, 
          date_of_birth,
          isRegister: true 
        }),
      });
      storage.setToken(result.token);
      storage.setUser(result.user);
      return result;
    },
    
    login: async (email, password) => {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      storage.setToken(result.token);
      storage.setUser(result.user);
      return result;
    },
    
    logout: () => {
      storage.removeToken();
      storage.removeUser();
    },
    
    me: async () => {
      try {
        const user = await request('/auth/me');
        storage.setUser(user);
        return user;
      } catch (error) {
        storage.removeToken();
        storage.removeUser();
        throw error;
      }
    },
    
    updateProfile: async (data) => {
      const user = await request('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      storage.setUser(user);
      return user;
    },
    
    changePassword: async (currentPassword, newPassword) => {
      return await request('/auth/me', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
    
    isAuthenticated: () => !!storage.getToken(),
    getCurrentUser: () => storage.getUser(),
  },
  
  // Weight tracking - DOAR PostgreSQL!
  weight: {
    list: async () => {
      try {
        const result = await request('/weight');
        return result;
      } catch (error) {
        console.error('❌ weight.list FAILED:', error.message);
        throw new Error(`PostgreSQL error: ${error.message}`);
      }
    },
    add: async (payload, maybeDate, maybeNotes) => {
      let body;
      if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
        body = payload;
      } else {
        body = {
          weight: payload,
          date: maybeDate,
          notes: maybeNotes,
        };
      }

      try {
        const result = await request('/weight', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        console.log('✅ weight.add SUCCESS în PostgreSQL:', result);
        return result;
      } catch (error) {
        console.error('❌ weight.add FAILED:', error.message);
        throw new Error(`PostgreSQL save FAILED: ${error.message}`);
      }
    },
    delete: async (id) => {
      try {
        await request(`/weight/${id}`, { method: 'DELETE' });
        console.log('✅ weight.delete SUCCESS în PostgreSQL');
      } catch (error) {
        console.error('❌ weight.delete FAILED:', error.message);
        throw new Error(`PostgreSQL delete FAILED: ${error.message}`);
      }
    },
  },
  
  // Meals
  meals: {
    list: () => request('/meals'),
    getByDay: (day) => request(`/meals/day/${day}`),
    add: (meal) => request('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),
    update: (id, data) => request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => request(`/meals/${id}`, { method: 'DELETE' }),
  },
  
  // Recipes
  recipes: {
    list: () => request('/recipes'),
    get: (id) => request(`/recipes/${id}`),
    create: (recipe) => request('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),
    update: (id, data) => request(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => request(`/recipes/${id}`, { method: 'DELETE' }),
  },

  // Countries (combined in /api/recipes.js with ?countries=true)
  countries: {
    list: () => request('/recipes?countries=true'),
  },
  
  // Progress
  progress: {
    list: () => request('/progress'),
    add: (note) => request('/progress', {
      method: 'POST',
      body: JSON.stringify(note),
    }),
  },
  
  // Users & Friends
  users: {
    list: () => request('/users'),
  },
  
  friends: {
    list: () => request('/friends'),
    add: (friendId) => request('/friends', {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId }),
    }),
  },
  
  // Messages
  messages: {
    list: () => request('/messages'),
    send: (toUserId, message) => request('/messages', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, message }),
    }),
    markAsRead: (id) => request(`/messages/${id}/read`, { method: 'PUT' }),
  },
  
  // Admin
  admin: {
    users: () => request('/admin/users'),
    weightEntries: () => request('/admin/weight-entries'),
    updateRole: (userId, role) => request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
    resetPassword: (userId, newPassword) => request(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
    deleteUser: (userId) => request(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),
    grantPremium: (userId, durationMonths = 'lifetime') => request('/auth/me?subscription=grant', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId, durationMonths }),
    }),
    backups: {
      list: () => request('/admin/backups'),
      create: () => request('/admin/backup', { method: 'POST' }),
      delete: (id) => request(`/admin/backup/${id}`, { method: 'DELETE' }),
    },
    // Payment Processors Management
    paymentProcessors: {
      list: () => request('/admin/payment-processors'),
      get: (id) => request(`/admin/payment-processors/${id}`),
      create: (processorData) => request('/admin/payment-processors', {
        method: 'POST',
        body: JSON.stringify(processorData),
      }),
      update: (id, updates) => request(`/admin/payment-processors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
      delete: (id) => request(`/admin/payment-processors/${id}`, { method: 'DELETE' }),
      test: (id) => request(`/admin/payment-processors/${id}/test`, { method: 'POST' }),
    },
    // Payment Transactions
    paymentTransactions: {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/payment-transactions${query ? '?' + query : ''}`);
      },
      get: (id) => request(`/admin/payment-transactions/${id}`),
    },
  },
  
  // Daily Check-ins - DOAR PostgreSQL, ZERO localStorage!
  checkins: {
    list: async () => {
      // STRICT: DOAR PostgreSQL, NU localStorage fallback!
      try {
        const result = await request('/checkins');
        return result;
      } catch (error) {
        console.error('❌ checkins.list FAILED:', error.message);
        // NU fallback la localStorage - throw error pentru debugging
        throw new Error(`PostgreSQL error: ${error.message}`);
      }
    },
    get: async (date) => {
      // STRICT: DOAR PostgreSQL!
      try {
        const result = await request(`/checkins/${date}`);
        return result || null;
      } catch (error) {
        console.error(`❌ checkins.get(${date}) FAILED:`, error.message);
        // NU fallback - returnează null dacă nu există
        return null;
      }
    },
    listByUser: async () => {
      // Alias pentru list() - DOAR PostgreSQL
      return await this.list();
    },
    upsert: async (payload) => {
      // STRICT: DOAR PostgreSQL, ZERO localStorage!
      try {
        const result = await request('/checkins', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        console.log('✅ checkins.upsert SUCCESS în PostgreSQL:', result);
        return result;
      } catch (error) {
        console.error('❌ checkins.upsert FAILED:', error.message);
        // NU salvăm în localStorage - THROW error pentru debugging
        throw new Error(`PostgreSQL save FAILED: ${error.message}`);
      }
    },
  },

  // Seed data
  seed: () => request('/seed', { method: 'POST' }),
  
  // Entities API - pentru compatibilitate cu base44
  entities: {
    User: {
      list: async (sort = '-created_date') => {
        // Returnează lista de utilizatori (doar pentru admin)
        try {
          return await request('/admin/users');
        } catch (error) {
          console.error('Error fetching users:', error);
          return [];
        }
      },
      get: async (id) => {
        try {
          return await request(`/admin/users/${id}`);
        } catch (error) {
          console.error('Error fetching user:', error);
          return null;
        }
      },
    },
    Recipe: {
      list: async (sort = '-created_date') => {
        try {
          return await request('/recipes');
        } catch (error) {
          console.error('Error fetching recipes:', error);
          return [];
        }
      },
      get: async (id) => {
        try {
          return await request(`/recipes/${id}`);
        } catch (error) {
          console.error('Error fetching recipe:', error);
          return null;
        }
      },
      create: async (data) => {
        return await request('/recipes', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
      update: async (id, data) => {
        return await request(`/recipes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },
      delete: async (id) => {
        return await request(`/recipes/${id}`, {
          method: 'DELETE',
        });
      },
    },
    AdminChat: {
      list: async (sort = '-created_date') => {
        try {
          return await request('/admin/support');
        } catch (error) {
          console.error('Error fetching admin chats:', error);
          return [];
        }
      },
      update: async (id, data) => {
        return await request(`/admin/support/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },
    },
    DailyCheckIn: {
      list: async (sort = '-date') => {
        try {
          return await request('/admin/checkins');
        } catch (error) {
          console.error('Error fetching check-ins:', error);
          return [];
        }
      },
    },
  },
  
  // Friends (combined in /api/social.js)
  friends: {
    list: () => request('/social?type=friends'),
    search: (email) => request(`/social?type=friends&search=${encodeURIComponent(email)}`),
    sendRequest: (friendEmail) => request('/social?type=friends', {
      method: 'POST',
      body: JSON.stringify({ friendEmail }),
    }),
    getRequests: () => request('/social?type=friends&requests=true'),
    acceptRequest: (requestId) => request('/social?type=friends', {
      method: 'PUT',
      body: JSON.stringify({ requestId, action: 'accept' }),
    }),
    rejectRequest: (requestId) => request('/social?type=friends', {
      method: 'PUT',
      body: JSON.stringify({ requestId, action: 'reject' }),
    }),
    remove: (friendshipId) => request(`/social?type=friends&id=${friendshipId}`, { method: 'DELETE' }),
    getProgress: () => request('/social?type=friends&progress=true'),
  },

  // User Recipes (combined in /api/social.js)
  userRecipes: {
    list: () => request('/social?type=recipes'),
    friendsRecipes: () => request('/social?type=recipes&friends=true'),
    create: (recipe) => request('/social?type=recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),
    update: (id, data) => request('/social?type=recipes', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    }),
    delete: (id) => request(`/social?type=recipes&id=${id}`, { method: 'DELETE' }),
  },

  // Notifications (combined in /api/social.js)
  notifications: {
    list: () => request('/social?type=notifications'),
    getUnreadCount: () => request('/social?type=notifications&unread=true'),
    markAsRead: (id) => request(`/social?type=notifications&id=${id}`, { method: 'PUT' }),
    markAllAsRead: () => request('/social?type=notifications&readAll=true', { method: 'PUT' }),
  },

  // Subscription (combined in /api/auth/me with query params)
  subscription: {
    getStatus: () => request('/auth/me?subscription=status'),
    checkLimits: (feature) => request('/auth/me?subscription=check-limits', {
      method: 'POST',
      body: JSON.stringify({ feature }),
    }),
    grantPremium: (targetUserId, durationMonths) => request('/auth/me?subscription=grant', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, durationMonths }),
    }),
  },
  
  // Integrations - pentru compatibilitate cu base44
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = storage.getToken();
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        return await response.json();
      },
    },
  },
};

export default localApi;

