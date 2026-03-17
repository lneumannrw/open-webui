import { supabase } from '$lib/supabaseClient';
import type { Kunde } from '$lib/types/kunden';
import type { VertragWithKunde } from '$lib/types/vertraege';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const [vertraegeRes, kundenRes] = await Promise.all([
		supabase
			.from('vertraege')
			.select('*, kunden(unternehmensname, kundennummer)')
			.order('created_at', { ascending: false }),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true })
	]);

	const vertraegeError = vertraegeRes.error;
	const kError = kundenRes.error;

	if (vertraegeError) {
		console.error('Verträge load error:', vertraegeError);
		return {
			vertraege: [] as VertragWithKunde[],
			kunden: (kundenRes.data ?? []) as Kunde[],
			error: vertraegeError.message
		};
	}
	if (kError) {
		console.error('Kunden load error (for dropdown):', kError);
		return {
			vertraege: (vertraegeRes.data ?? []) as VertragWithKunde[],
			kunden: [] as Kunde[],
			error: kError.message
		};
	}

	return {
		vertraege: (vertraegeRes.data ?? []) as VertragWithKunde[],
		kunden: (kundenRes.data ?? []) as Kunde[]
	};
};

