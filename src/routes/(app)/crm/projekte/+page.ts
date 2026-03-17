import { supabase } from '$lib/supabaseClient';
import type { Kunde } from '$lib/types/kunden';
import type { ProjektWithBausteineCount } from '$lib/types/projekte';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const [projekteRes, kundenRes] = await Promise.all([
		supabase
			.from('projekte')
			.select('*, projekt_bausteine(id)')
			.order('created_at', { ascending: false }),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true })
	]);

	const projekteError = projekteRes.error;
	const kError = kundenRes.error;

	if (projekteError) {
		console.error('Projekte load error:', projekteError);
		return {
			projekte: [] as ProjektWithBausteineCount[],
			kunden: (kundenRes.data ?? []) as Kunde[],
			error: projekteError.message
		};
	}
	if (kError) {
		console.error('Kunden load error (for dropdown):', kError);
		return {
			projekte: (projekteRes.data ?? []) as ProjektWithBausteineCount[],
			kunden: [] as Kunde[],
			error: kError.message
		};
	}

	return {
		projekte: (projekteRes.data ?? []) as ProjektWithBausteineCount[],
		kunden: (kundenRes.data ?? []) as Kunde[]
	};
};

