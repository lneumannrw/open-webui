import { supabase } from '$lib/supabaseClient';
import type { Kunde } from '$lib/types/kunden';
import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const [ansprechpartnerRes, kundenRes] = await Promise.all([
		supabase
			.from('ansprechpartner')
			.select('*, kunden(unternehmensname, kundennummer)')
			.order('nachname', { ascending: true }),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true })
	]);

	const apError = ansprechpartnerRes.error;
	const kError = kundenRes.error;

	if (apError) {
		console.error('Ansprechpartner load error:', apError);
		return {
			ansprechpartner: [] as AnsprechpartnerWithKunde[],
			kunden: (kundenRes.data ?? []) as Kunde[],
			error: apError.message
		};
	}
	if (kError) {
		console.error('Kunden load error (for dropdown):', kError);
		return {
			ansprechpartner: (ansprechpartnerRes.data ?? []) as AnsprechpartnerWithKunde[],
			kunden: [] as Kunde[],
			error: kError.message
		};
	}

	return {
		ansprechpartner: (ansprechpartnerRes.data ?? []) as AnsprechpartnerWithKunde[],
		kunden: (kundenRes.data ?? []) as Kunde[]
	};
};

