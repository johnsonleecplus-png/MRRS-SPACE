export interface StorageAdapter {
  name: string;
  isEnabled: boolean;
  /**
   * Initialize the connection if needed
   */
  init(): Promise<void>;
  /**
   * Load the websites data
   */
  load(): Promise<any | null>;
  /**
   * Save the websites data
   */
  save(data: any): Promise<boolean>;
}

export interface StorageConfig {
  provider: 'supabase' | 'pocketbase' | 'local';
}
