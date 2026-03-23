import { StorageAdapter } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class MySQLAdapter implements StorageAdapter {
  name = 'MySQL';
  isEnabled = false;

  constructor() {
    this.isEnabled = true;
  }

  async init(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
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
      const response = await fetch(`${API_BASE_URL}/websites`);
      
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
      const response = await fetch(`${API_BASE_URL}/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
