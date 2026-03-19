import { supabase } from '$lib/supabaseClient';
import type { Ansprechpartner } from '$lib/types/ansprechpartner';
import type { Kunde } from '$lib/types/kunden';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	const id = params.id;

	const [apRes, kundenRes] = await Promise.all([
		supabase
			.from('ansprechpartner')
			.select('*, kunden(id, kundennummer, unternehmensname)')
			.eq('id', id)
			.single(),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true })
	]);

	const error = apRes.error?.message || kundenRes.error?.message;

	if (error) {
		console.error('Ansprechpartner detail load error:', { ap: apRes.error, kunden: kundenRes.error });
	}

	return {
		ansprechpartner: (apRes.data ?? null) as Ansprechpartner | null,
		kunden: (kundenRes.data ?? []) as Kunde[],
		error: error ?? null
	};
};
