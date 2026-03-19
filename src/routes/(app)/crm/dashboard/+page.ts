import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const todayIso = new Date().toISOString().split('T')[0];
	const in90days = new Date(Date.now() + 90 * 86_400_000).toISOString().split('T')[0];

	const [
		kundenTotalRes,
		kundenLeadRes,
		kundenAktivRes,
		projekteOffenRes,
		projekteInArbeitRes,
		projekteAbgeschlossenRes,
		anfragenAllRes,
		vertraegeAktivRes,
		kundenRecentRes,
		projekteRecentRes,
		anfragenRecentRes,
		vertraegeRecentRes,
		vertraegeExpiringRes
	] = await Promise.all([
		// 1–3: Kunden counts
		supabase.from('kunden').select('*', { count: 'exact', head: true }),
		supabase.from('kunden').select('*', { count: 'exact', head: true }).eq('status', 'Lead'),
		supabase.from('kunden').select('*', { count: 'exact', head: true }).eq('status', 'Aktiv'),
		// 4–6: Projekte counts
		supabase.from('projekte').select('*', { count: 'exact', head: true }).eq('status', 'Offen'),
		supabase
			.from('projekte')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'In Arbeit'),
		supabase
			.from('projekte')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'Abgeschlossen'),
		// 7: Alle Anfragen (für Pipeline + KPI)
		supabase.from('anfragen').select('status, budget'),
		// 8: Aktive Verträge (enddatum >= today ODER null)
		supabase
			.from('vertraege')
			.select('wert, enddatum')
			.or(`enddatum.gte.${todayIso},enddatum.is.null`),
		// 9–12: Recent items (letzte 5 pro Tabelle)
		supabase
			.from('kunden')
			.select('id, unternehmensname, created_at')
			.order('created_at', { ascending: false })
			.limit(5),
		supabase
			.from('projekte')
			.select('id, name, kunden_id, kunden(unternehmensname), created_at')
			.order('created_at', { ascending: false })
			.limit(5),
		supabase
			.from('anfragen')
			.select('id, titel, status, kunden_id, kunden(unternehmensname), created_at')
			.order('created_at', { ascending: false })
			.limit(5),
		supabase
			.from('vertraege')
			.select('id, bezeichnung, kunde_id, kunden(unternehmensname), created_at')
			.order('created_at', { ascending: false })
			.limit(5),
		// 13: Auslaufende Verträge (nächste 90 Tage)
		supabase
			.from('vertraege')
			.select(
				'id, bezeichnung, vertragsnummer, wert, enddatum, kunde_id, kunden(unternehmensname)'
			)
			.gte('enddatum', todayIso)
			.lte('enddatum', in90days)
			.order('enddatum', { ascending: true })
	]);

	// --- KPI ---
	const kundenTotal = kundenTotalRes.count ?? 0;
	const kundenLead = kundenLeadRes.count ?? 0;
	const kundenAktiv = kundenAktivRes.count ?? 0;
	const projekteOffen = projekteOffenRes.count ?? 0;
	const projekteInArbeit = projekteInArbeitRes.count ?? 0;
	const projekteAbgeschlossen = projekteAbgeschlossenRes.count ?? 0;

	// --- Pipeline (aus allen Anfragen) ---
	const anfragenAll = anfragenAllRes.data ?? [];
	const statusOrder = ['Neu', 'In Bearbeitung', 'Gewonnen', 'Verloren', 'Abgebrochen'];
	const pipelineMap = new Map<string, { count: number; budget: number }>();
	for (const s of statusOrder) pipelineMap.set(s, { count: 0, budget: 0 });

	let pipelineTotal = 0;
	let pipelineTotalBudget = 0;
	for (const a of anfragenAll) {
		const st = a.status ?? 'Neu';
		const b = Number(a.budget) || 0;
		const entry = pipelineMap.get(st);
		if (entry) {
			entry.count++;
			entry.budget += b;
		}
		pipelineTotal++;
		pipelineTotalBudget += b;
	}

	const pipeline = statusOrder.map((s) => ({
		status: s,
		count: pipelineMap.get(s)!.count,
		budget: pipelineMap.get(s)!.budget
	}));

	// Offene Anfragen = Neu + In Bearbeitung
	const anfragenOffen =
		(pipelineMap.get('Neu')?.count ?? 0) + (pipelineMap.get('In Bearbeitung')?.count ?? 0);
	const anfragenOffenBudget =
		(pipelineMap.get('Neu')?.budget ?? 0) + (pipelineMap.get('In Bearbeitung')?.budget ?? 0);

	// Vertragsvolumen
	const vertragsvolumen = (vertraegeAktivRes.data ?? []).reduce(
		(s: number, r: any) => s + (Number(r.wert) || 0),
		0
	);

	// --- Recent Activity (8 items aus 4 Tabellen) ---
	type ActivityItem = {
		type: 'kunde' | 'anfrage' | 'projekt' | 'vertrag';
		id: string;
		label: string;
		sublabel?: string;
		created_at: string | null;
	};

	const kundenRecent: ActivityItem[] = (kundenRecentRes.data ?? []).map((r: any) => ({
		type: 'kunde',
		id: r.id,
		label: r.unternehmensname,
		created_at: r.created_at
	}));
	const anfragenRecent: ActivityItem[] = (anfragenRecentRes.data ?? []).map((r: any) => ({
		type: 'anfrage',
		id: r.id,
		label: r.titel,
		sublabel: r.kunden?.unternehmensname,
		created_at: r.created_at
	}));
	const projekteRecent: ActivityItem[] = (projekteRecentRes.data ?? []).map((r: any) => ({
		type: 'projekt',
		id: r.id,
		label: r.name,
		sublabel: r.kunden?.unternehmensname,
		created_at: r.created_at
	}));
	const vertraegeRecent: ActivityItem[] = (vertraegeRecentRes.data ?? []).map((r: any) => ({
		type: 'vertrag',
		id: r.id,
		label: r.bezeichnung,
		sublabel: r.kunden?.unternehmensname,
		created_at: r.created_at
	}));

	const recentActivity = [
		...kundenRecent,
		...anfragenRecent,
		...projekteRecent,
		...vertraegeRecent
	]
		.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
		.slice(0, 8);

	// --- Expiring Contracts ---
	const expiringContracts = (vertraegeExpiringRes.data ?? []).map((r: any) => ({
		id: r.id,
		bezeichnung: r.bezeichnung,
		vertragsnummer: r.vertragsnummer,
		wert: Number(r.wert) || 0,
		enddatum: r.enddatum,
		kundeName: r.kunden?.unternehmensname ?? '–'
	}));

	return {
		kpi: {
			kundenTotal,
			kundenLead,
			kundenAktiv,
			anfragenOffen,
			anfragenOffenBudget,
			projekteInArbeit,
			vertragsvolumen
		},
		pipeline,
		pipelineTotal,
		pipelineTotalBudget,
		recentActivity,
		expiringContracts,
		projectStatus: {
			offen: projekteOffen,
			inArbeit: projekteInArbeit,
			abgeschlossen: projekteAbgeschlossen
		}
	};
};
