// Stable client wrapper to avoid blank-screen when Vite env vars are missing at build time.
// NOTE: This only uses public values (URL + anon/publishable key).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const FALLBACK_URL = "https://auongaejhsbcoietwyrw.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b25nYWVqaHNiY29pZXR3eXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDgzNzQsImV4cCI6MjA4MTU4NDM3NH0.1KiT6IL_aS_YSaEkgzUrF5O8JrbUjZ1Q_mWn0I3GJAY";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
