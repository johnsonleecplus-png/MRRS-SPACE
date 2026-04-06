import { StorageAdapter } from './types';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__ENV__?.VITE_API_BASE_URL) return window.__ENV__.VITE_API_BASE_URL;
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

export class MySQLAdapter implements StorageAdapter {
  name = 'MySQL';
  isEnabled = false;

  constructor() {
    this.isEnabled = true;
  }

  async init(): Promise<void> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/health`, { credentials: 'same-origin' });
      if (response.ok) {
        console.log('MySQL backend connected successfully');
        this.isEnabled = true;
      }
    } catch (e) {
      console.error('MySQL backend connection failed', e);
      this.isEnabled = false;
    }
  }

  async load(): Promise<any | null> {
    if (!this.isEnabled) return null;

    try {
      const response = await fetch(`${getApiBaseUrl()}/websites`, { credentials: 'same-origin' });
      
      if (!response.ok) {
        console.error('MySQL load error:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data || null;
    } catch (e) {
      console.error('MySQL load exception:', e);
      return null;
    }
  }

  async save(data: any): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Confirm-Seed': 'YES',
      };

      const response = await fetch(`${getApiBaseUrl()}/seed`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          ...headers,
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        console.error('MySQL save error:', response.statusText);
        return false;
      }

      return true;
    } catch (e) {
      console.error('MySQL save exception:', e);
      return false;
    }
  }
}
