import { supabase } from '$lib/supabaseClient';
import type { Kunde } from '$lib/types/kunden';
import type { AnfrageWithKunde } from '$lib/types/anfragen';

export async function load() {
	const [anfragenRes, kundenRes] = await Promise.all([
		supabase
			.from('anfragen')
			.select('*, kunden(unternehmensname, kundennummer)')
			.order('created_at', { ascending: false }),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true })
	]);

	const anfragenError = anfragenRes.error;
	const kError = kundenRes.error;

	if (anfragenError) {
		console.error('Anfragen load error:', anfragenError);
		return {
			anfragen: [] as AnfrageWithKunde[],
			kunden: (kundenRes.data ?? []) as Kunde[],
			error: anfragenError.message
		};
	}
	if (kError) {
		console.error('Kunden load error (for dropdown):', kError);
		return {
			anfragen: (anfragenRes.data ?? []) as AnfrageWithKunde[],
			kunden: [] as Kunde[],
			error: kError.message
		};
	}

	return {
		anfragen: (anfragenRes.data ?? []) as AnfrageWithKunde[],
		kunden: (kundenRes.data ?? []) as Kunde[]
	};
}
