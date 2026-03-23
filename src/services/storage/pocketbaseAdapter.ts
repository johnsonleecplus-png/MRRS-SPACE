import PocketBase from 'pocketbase';
import { StorageAdapter } from './types';

const COLLECTION_NAME = 'kv_store';
const DATA_KEY = 'websites_data';

export class PocketBaseAdapter implements StorageAdapter {
  name = 'PocketBase (NAS)';
  isEnabled = false;
  private pb: PocketBase | null = null;

  constructor() {
    // You can set this in .env: VITE_POCKETBASE_URL=http://192.168.1.xxx:8090
    const url = import.meta.env.VITE_POCKETBASE_URL;
    
    if (url) {
      try {
        this.pb = new PocketBase(url);
        this.isEnabled = true;
      } catch (e) {
        console.error('PocketBase init failed', e);
      }
    }
  }

  async init(): Promise<void> {
    // Check if we need to authenticate or just check health
    // For now we assume public read/write or handled by auto-cancellation
  }

  async load(): Promise<any | null> {
    if (!this.pb || !this.isEnabled) return null;

    try {
      // PocketBase uses 'list' to find items. We search by a filter.
      // Assuming we have a field 'key' in the collection.
      const result = await this.pb.collection(COLLECTION_NAME).getList(1, 1, {
        filter: `key = "${DATA_KEY}"`,
      });

      if (result.items.length > 0) {
        return result.items[0].value;
      }
      return null;
    } catch (e) {
      console.error('PocketBase load error:', e);
      return null;
    }
  }

  async save(data: any): Promise<boolean> {
    if (!this.pb || !this.isEnabled) return false;

    try {
      // First, try to find the existing record
      const result = await this.pb.collection(COLLECTION_NAME).getList(1, 1, {
        filter: `key = "${DATA_KEY}"`,
      });

      if (result.items.length > 0) {
        // Update
        const id = result.items[0].id;
        await this.pb.collection(COLLECTION_NAME).update(id, {
          value: data
        });
      } else {
        // Create
        await this.pb.collection(COLLECTION_NAME).create({
          key: DATA_KEY,
          value: data
        });
      }
      return true;
    } catch (e) {
      console.error('PocketBase save error:', e);
      return false;
    }
  }
}
