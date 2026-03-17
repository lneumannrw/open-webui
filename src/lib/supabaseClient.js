import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/public";

// Supabase zwingt uns, eine formal korrekte URL zu übergeben, 
// sonst crasht der SvelteKit Build-Prozess.
const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';

if (!env.PUBLIC_SUPABASE_URL) {
    console.warn("Supabase Variablen fehlen (oder SvelteKit Build-Phase läuft gerade)");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseApp = supabase;