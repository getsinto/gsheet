import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid throwing at import time in Next.js; prefer runtime checks.
  console.warn("Supabase env vars are not set. Check .env.local");
}

// Lightweight unauthenticated client (rarely needed when using auth-helpers)
export const supabase = createClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "");

// Browser (Client Components)
export const createBrowserClient = () => createClientComponentClient<Database>();
