import { createClient } from '@supabase/supabase-js';

// Simple approach: create client when accessed, not when module loads
let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.ANON_KEY || process.env.NEXT_PUBLIC_ANON_KEY;

    if (!url || !key) {
      console.error('❌ Missing Supabase credentials at runtime');
      console.error('URL:', url ? 'Present' : 'Missing');
      console.error('Key:', key ? 'Present' : 'Missing');
      // Don't throw - create dummy client
      client = createClient('https://dummy.supabase.co', 'dummy');
    } else {
      client = createClient(url, key);
    }
  }
  return client;
}

// Export a proxy that creates the client on first access
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getClient();
    return client[prop as keyof typeof client];
  }
});

