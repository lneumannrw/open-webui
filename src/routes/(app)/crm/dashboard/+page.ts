import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const todayIso = new Date().toISOString().split('T')[0];

	const [
		kundenTotalRes,
		kundenLeadRes,
		kundenAktivRes,
		projekteInArbeitRes,
		anfragenBudgetRes,
		vertraegeRes,
		kundenRecentRes,
		projekteRecentRes
	] = await Promise.all([
		supabase.from('kunden').select('*', { count: 'exact', head: true }),
		supabase.from('kunden').select('*', { count: 'exact', head: true }).eq('status', 'Lead'),
		supabase.from('kunden').select('*', { count: 'exact', head: true }).eq('status', 'Aktiv'),
		supabase
			.from('projekte')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'In Arbeit'),
		supabase.from('anfragen').select('budget'),
		supabase
			.from('vertraege')
			.select('wert, enddatum')
			.or(`enddatum.gte.${todayIso},enddatum.is.null`),
		supabase
			.from('kunden')
			.select('id, unternehmensname, created_at')
			.order('created_at', { ascending: false })
			.limit(5),
		supabase
			.from('projekte')
			.select('id, name, created_at')
			.order('created_at', { ascending: false })
			.limit(5)
	]);

	const kundenTotal = kundenTotalRes.count ?? 0;
	const kundenLead = kundenLeadRes.count ?? 0;
	const kundenAktiv = kundenAktivRes.count ?? 0;
	const projekteInArbeit = projekteInArbeitRes.count ?? 0;

	const pipelineWert =
		(anfragenBudgetRes.data ?? []).reduce((s, r) => s + (Number(r.budget) || 0), 0) as number;
	const vertragsvolumen = (vertraegeRes.data ?? []).reduce(
		(s, r) => s + (Number(r.wert) || 0),
		0
	) as number;

	const kundenRecent = (kundenRecentRes.data ?? []).map((r) => ({
		type: 'kunde' as const,
		id: r.id,
		label: r.unternehmensname,
		created_at: r.created_at
	}));
	const projekteRecent = (projekteRecentRes.data ?? []).map((r) => ({
		type: 'projekt' as const,
		id: r.id,
		label: r.name,
		created_at: r.created_at
	}));
	const recentActivity = [...kundenRecent, ...projekteRecent]
		.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
		.slice(0, 5);

	return {
		kpi: {
			kundenTotal,
			kundenLead,
			kundenAktiv,
			projekteInArbeit,
			pipelineWert,
			vertragsvolumen
		},
		recentActivity
	};
};

