// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dbbnmvvuppizdpvqaeun.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiYm5tdnZ1cHBpemRwdnFhZXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjUyNDIsImV4cCI6MjA2NzkwMTI0Mn0.Ee-XMY5gIy1POmS37yMyJNZDeTJ4uuQe7BDNm6PAI4E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});