import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/public";

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase Variablen fehlen in den Easypanel Environment Settings!");
}

// Der Client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// DIESE ZEILE HINZUFÜGEN, damit der restliche Code nicht meckert:
export const supabaseApp = supabase;