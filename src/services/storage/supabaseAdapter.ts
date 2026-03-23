import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageAdapter } from './types';

const TABLE_NAME = 'kv_store_a5bad527';
const DATA_KEY = 'websites_data';

export class SupabaseAdapter implements StorageAdapter {
  name = 'Supabase';
  isEnabled = false;
  private client: SupabaseClient | null = null;

  constructor() {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (projectId && anonKey) {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      try {
        this.client = createClient(supabaseUrl, anonKey);
        this.isEnabled = true;
      } catch (e) {
        console.error('Supabase init failed', e);
      }
    }
  }

  async init(): Promise<void> {
    // No async init needed for Supabase js client usually, 
    // but we could check connection here if we wanted.
  }

  async load(): Promise<any | null> {
    if (!this.client || !this.isEnabled) return null;

    try {
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .select('value')
        .eq('key', DATA_KEY)
        .maybeSingle();

      if (error) {
        console.error('Supabase load error:', error);
        return null;
      }

      return data?.value || null;
    } catch (e) {
      console.error('Supabase load exception:', e);
      return null;
    }
  }

  async save(data: any): Promise<boolean> {
    if (!this.client || !this.isEnabled) return false;

    try {
      const { error } = await this.client
        .from(TABLE_NAME)
        .upsert({ key: DATA_KEY, value: data });

      if (error) {
        console.error('Supabase save error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase save exception:', e);
      return false;
    }
  }
}
