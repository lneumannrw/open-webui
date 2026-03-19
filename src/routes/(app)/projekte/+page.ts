import { supabase } from '$lib/supabaseClient';
import type { Kunde } from '$lib/types/kunden';
import type { ProjektWithBausteineCount, ProjektBausteinWithProjekt } from '$lib/types/projekte';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const [projekteRes, kundenRes, bausteinRes] = await Promise.all([
		supabase
			.from('projekte')
			.select('*, projekt_bausteine(id)')
			.order('created_at', { ascending: false }),
		supabase
			.from('kunden')
			.select('id, kundennummer, unternehmensname')
			.order('kundennummer', { ascending: true }),
		supabase
			.from('projekt_bausteine')
			.select('*, projekte(id, name)')
			.order('created_at', { ascending: false })
	]);

	return {
		projekte: (projekteRes.data ?? []) as ProjektWithBausteineCount[],
		kunden: (kundenRes.data ?? []) as Kunde[],
		bausteine: (bausteinRes.data ?? []) as ProjektBausteinWithProjekt[],
		error: projekteRes.error?.message ?? kundenRes.error?.message ?? bausteinRes.error?.message
	};
};
