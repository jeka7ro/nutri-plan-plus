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
    register: async (email, password, name, phone, country_code, country, city, date_of_birth) => {
      const result = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          phone, 
          country_code, 
          country, 
          city, 
          date_of_birth 
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
    
    isAuthenticated: () => !!storage.getToken(),
    getCurrentUser: () => storage.getUser(),
  },
  
  // Weight tracking
  weight: {
    list: () => request('/weight'),
    add: (payload, maybeDate, maybeNotes) => {
      // Accept both object payloads and legacy (weight, date, notes) signature
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

      return request('/weight', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    delete: (id) => request(`/weight/${id}`, { method: 'DELETE' }),
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
    backups: {
      list: () => request('/admin/backups'),
      create: () => request('/admin/backup', { method: 'POST' }),
      delete: (id) => request(`/admin/backup/${id}`, { method: 'DELETE' }),
    },
  },
  
  // Daily Check-ins
  checkins: {
    get: async (date) => {
      try {
        return await request(`/checkins/${date}`);
      } catch (error) {
        console.error('❌ GET checkin error:', error);
        return null;
      }
    },
    list: async () => {
      try {
        return await request('/checkins');
      } catch (error) {
        console.error('❌ LIST checkins error:', error);
        return [];
      }
    },
    upsert: async (data) => {
      console.log('📡 localApi.checkins.upsert CALLED with:', data);
      try {
        const result = await request('/checkins', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        console.log('✅ localApi.checkins.upsert SUCCESS:', result);
        return result;
      } catch (error) {
        console.error('❌ localApi.checkins.upsert ERROR:', error);
        throw error;
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

