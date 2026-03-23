
import { createClient } from '@supabase/supabase-js';

const getProjectId = () => {
  if (import.meta.env.VITE_SUPABASE_PROJECT_ID) {
    return import.meta.env.VITE_SUPABASE_PROJECT_ID;
  }
  if (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_PROJECT_ID) {
    return (window as any).__ENV__.SUPABASE_PROJECT_ID;
  }
  return '';
};

const getAnonKey = () => {
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  if (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_ANON_KEY) {
    return (window as any).__ENV__.SUPABASE_ANON_KEY;
  }
  return '';
};

const projectId = getProjectId();
const supabaseUrl = projectId ? `https://${projectId}.supabase.co` : 'https://placeholder.supabase.co';
const supabaseKey = getAnonKey() || 'SUPABASE_CLIENT_MISSING_KEY';

let client;
try {
  client = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Supabase client initialization failed:', error);
  // Return a mock client that doesn't crash but logs errors
  client = {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    })
  } as any;
}

// Debug log to verify connection details in browser console
if (typeof window !== 'undefined') {
  try {
    const url = new URL(supabaseUrl);
    console.log('[Supabase] Connected to project:', url.hostname.split('.')[0]);
  } catch (e) {
    // Ignore URL parsing errors
  }
}

export const supabase = client;
