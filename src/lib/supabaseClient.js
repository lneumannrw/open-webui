import { createClient } from "@supabase/supabase-js";
// WICHTIG: Wir nutzen jetzt 'dynamic' statt 'static'
import { env } from "$env/dynamic/public";

// Variablen dynamisch zur Laufzeit abrufen
const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

// Warnung ausgeben, falls die Variablen in Easypanel vergessen wurden
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase Variablen fehlen in den Easypanel Environment Settings!");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');