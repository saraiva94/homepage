// Stable client wrapper to avoid blank-screen when Vite env vars are missing at build time.
// NOTE: This only uses public values (URL + anon/publishable key).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const FALLBACK_URL = "https://hunsahybxfntntzsydrh.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bnNhaHlieGZudG50enN5ZHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTI5ODYsImV4cCI6MjA5MDk4ODk4Nn0.bYmG1VLuDXkiyPV9V5FUjWx8BmGKhojemOJHWMdlD-M";

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
