import { StorageAdapter } from './types';
import { SupabaseAdapter } from './supabaseAdapter';
import { PocketBaseAdapter } from './pocketbaseAdapter';
import { MySQLAdapter } from './mysqlAdapter';

// Determine which provider to use based on environment variables
// Priority: MySQL > PocketBase > Supabase > Local (Fallback)

class StorageService {
  private adapter: StorageAdapter | null = null;

  constructor() {
    // If MySQL API URL is set, use it
    if (import.meta.env.VITE_API_BASE_URL) {
      this.adapter = new MySQLAdapter();
    }
    // If PocketBase URL is set, try to use it
    else if (import.meta.env.VITE_POCKETBASE_URL) {
      this.adapter = new PocketBaseAdapter();
    } 
    // Otherwise fallback to Supabase if configured
    else if (import.meta.env.VITE_SUPABASE_PROJECT_ID) {
      this.adapter = new SupabaseAdapter();
    }
  }

  getAdapter(): StorageAdapter | null {
    return this.adapter;
  }

  getProviderName(): string {
    return this.adapter?.name || 'Local Storage';
  }

  isCloudEnabled(): boolean {
    return this.adapter?.isEnabled || false;
  }
}

export const storageService = new StorageService();
