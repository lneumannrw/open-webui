import { supabase } from '$lib/supabaseClient';
import type { Kunde } from '$lib/types/kunden';

export async function load() {
	const { data, error } = await supabase
		.from('kunden')
		.select('*')
		.order('kundennummer', { ascending: true });

	if (error) {
		console.error('Kunden load error:', error);
		return { kunden: [] as Kunde[], error: error.message };
	}

	return { kunden: (data ?? []) as Kunde[] };
}
