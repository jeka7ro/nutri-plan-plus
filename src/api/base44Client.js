import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6905d7376c72470a48ccfd0d", 
  requiresAuth: false // Dezactivat pentru dezvoltare locală
});
