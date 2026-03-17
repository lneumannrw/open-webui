import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";

// Client mit den festen Build-Variablen erstellen
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Alias für Kompatibilität mit dem restlichen Code (z.B. dashboardLinks)
export const supabaseApp = supabase;