import { supabase } from '$lib/supabaseClient';
import type { AnfrageWithKunde } from '$lib/types/anfragen';
import type { Kunde } from '$lib/types/kunden';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	const id = params.id;

	const [anfrageRes, kundenRes] = await Promise.all([
		supabase
			.from('anfragen')
			.select('*, kunden(id, kundennummer, unternehmensname)')
			.eq('id', id)
			.single(),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true })
	]);

	const error = anfrageRes.error?.message || kundenRes.error?.message;

	if (error) {
		console.error('Anfrage detail load error:', { anfrage: anfrageRes.error, kunden: kundenRes.error });
	}

	return {
		anfrage: (anfrageRes.data ?? null) as AnfrageWithKunde | null,
		kunden: (kundenRes.data ?? []) as Kunde[],
		error: error ?? null
	};
};
