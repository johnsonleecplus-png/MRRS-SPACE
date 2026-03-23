
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = "fzgqflzakjrdlmftpebc";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Z3FmbHpha2pyZGxtZnRwZWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTUwMTksImV4cCI6MjA4MjU3MTAxOX0.zTNGniCXuXjBwYd4LfIxeotzUeJk_ngT2J1yG8JftOc";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const TABLE_NAME = 'kv_store_a5bad527';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkConnection() {
  console.log('Testing Supabase connection...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('key', 'websites_data')
      .maybeSingle();

    if (error) {
      console.error('Connection failed or query error:', error);
    } else {
      console.log('Connection successful!');
      if (data) {
        console.log('Data found:', data ? 'Yes (hidden)' : 'No');
      } else {
        console.log('No data found for key "websites_data", but connection is working.');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkConnection();
