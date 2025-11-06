// Adaptor pentru a face tranziția de la Base44 la API local
import localApi from './localClient';

// Creează un wrapper care mimează structura Base44
export const api = {
  auth: {
    me: () => localApi.auth.me(),
    updateMe: (data) => localApi.auth.updateProfile(data),
    logout: () => localApi.auth.logout(),
  },
  
  entities: {
    User: {
      list: () => localApi.users.list(),
      get: (id) => localApi.auth.me(), // Simplified
    },
    
    WeightEntry: {
      list: () => localApi.weight.list(),
      create: (data) => localApi.weight.add(data.weight, data.date, data.notes),
      delete: (id) => localApi.weight.delete(id),
    },
    
    Recipe: {
      list: () => localApi.recipes.list(),
      get: (id) => localApi.recipes.get(id),
      create: (data) => localApi.recipes.create(data),
      update: (id, data) => localApi.recipes.update(id, data),
      delete: (id) => localApi.recipes.delete(id),
    },
    
    DailyCheckIn: {
      list: () => localApi.checkins.list(),
      filter: (params) => {
        // Filter by date
        if (params.date) {
          return localApi.checkins.get(params.date).then(result => result ? [result] : []);
        }
        return localApi.checkins.list();
      },
      create: (data) => localApi.checkins.upsert(data),
      update: (id, data) => localApi.checkins.upsert(data),
    },
    
    Friendship: {
      list: () => localApi.friends.list(),
      create: (data) => localApi.friends.add(data.friend_id || data.receiver_id),
      filter: (params) => localApi.friends.list(),
    },
    
    Message: {
      list: () => localApi.messages.list(),
      create: (data) => localApi.messages.send(data.to_user_id || data.receiver_id, data.message || data.content),
      filter: (params) => localApi.messages.list(),
    },
  },

  // Shortcuts for direct access (compatibility)
  recipes: {
    list: () => localApi.recipes.list(),
    get: (id) => localApi.recipes.get(id),
    create: (data) => localApi.recipes.create(data),
    update: (id, data) => localApi.recipes.update(id, data),
    delete: (id) => localApi.recipes.delete(id),
  },
};

export default api;

