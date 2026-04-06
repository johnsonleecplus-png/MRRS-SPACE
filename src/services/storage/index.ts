import { StorageAdapter } from './types';
import { PocketBaseAdapter } from './pocketbaseAdapter';
import { MySQLAdapter } from './mysqlAdapter';

// Determine which provider to use based on environment variables
// Priority: MySQL > PocketBase > Local (Fallback)

class StorageService {
  private adapter: StorageAdapter | null = null;

  constructor() {
    const apiBaseUrl =
      (typeof window !== 'undefined' && window.__ENV__?.VITE_API_BASE_URL) ||
      import.meta.env.VITE_API_BASE_URL ||
      '';

    // If MySQL API URL is set, use it
    if (apiBaseUrl) {
      this.adapter = new MySQLAdapter();
    }
    // If PocketBase URL is set, try to use it
    else if (import.meta.env.VITE_POCKETBASE_URL) {
      this.adapter = new PocketBaseAdapter();
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
