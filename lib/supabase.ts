import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!; // 👈 string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!; // 👈 string

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
