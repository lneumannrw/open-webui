import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const today = new Date();
	const todayIso = today.toISOString().split('T')[0];
	const endDate = new Date(today);
	endDate.setMonth(endDate.getMonth() + 12);
	const endIso = endDate.toISOString().split('T')[0];

	const [
		bausteineRes,
		bausteineErledigtRes,
		anfragenGewonnenRes,
		anfragenVerlorenRes,
		vertraegeRes
	] = await Promise.all([
		supabase.from('projekt_bausteine').select('id', { count: 'exact', head: true }),
		supabase
			.from('projekt_bausteine')
			.select('id', { count: 'exact', head: true })
			.eq('erledigt', true),
		supabase.from('anfragen').select('id', { count: 'exact', head: true }).eq('status', 'Gewonnen'),
		supabase.from('anfragen').select('id', { count: 'exact', head: true }).eq('status', 'Verloren'),
		supabase
			.from('vertraege')
			.select('wert, enddatum')
			.not('enddatum', 'is', null)
			.gte('enddatum', todayIso)
			.lte('enddatum', endIso)
	]);

	const bausteineTotal = bausteineRes.count ?? 0;
	let bausteineErledigt = 0;
	if (bausteineErledigtRes.error) {
		// Column "erledigt" may not exist; ignore and show only total
	} else {
		bausteineErledigt = bausteineErledigtRes.count ?? 0;
	}

	const anfragenGewonnen = anfragenGewonnenRes.count ?? 0;
	const anfragenVerloren = anfragenVerlorenRes.count ?? 0;

	const vertraegeList = (vertraegeRes.data ?? []) as { wert: number | null; enddatum: string | null }[];
	const umsatzByMonth: Record<string, number> = {};
	for (const v of vertraegeList) {
		if (!v.enddatum) continue;
		const month = v.enddatum.slice(0, 7);
		umsatzByMonth[month] = (umsatzByMonth[month] ?? 0) + (Number(v.wert) || 0);
	}
	const umsatzVorschau = Object.entries(umsatzByMonth)
		.map(([month, sum]) => ({ month, sum }))
		.sort((a, b) => a.month.localeCompare(b.month));

	return {
		bausteineTotal,
		bausteineErledigt,
		anfragenGewonnen,
		anfragenVerloren,
		umsatzVorschau
	};
};

