import { supabase } from '$lib/supabaseClient';
import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';
import type { Kunde } from '$lib/types/kunden';
import type { Projekt } from '$lib/types/projekte';
import type { Rechnung } from '$lib/types/rechnungen';
import type { PageLoad } from './$types';

export const ssr = false;

type Termin = {
	id: string;
	kunden_id: string | null;
	titel?: string | null;
	beschreibung?: string | null;
	datum?: string | null;
	start_at?: string | null;
	starts_at?: string | null;
	end_at?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	[key: string]: unknown;
};

type Vertrag = {
	id: string;
	kunde_id: string;
	bezeichnung?: string | null;
	vertragsnummer?: string | null;
	wert?: number | null;
	status?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	[key: string]: unknown;
};

type ActivityItem = {
	id: string;
	type: 'projekt' | 'ansprechpartner' | 'termin' | 'vertrag';
	entity_id: string;
	href: string;
	title: string;
	subtitle: string | null;
	status: string | null;
	value: number | null;
	updated_at: string | null;
	rawDate: string | null;
};

function activityHref(type: ActivityItem['type'], entityId: string) {
	const base =
		type === 'projekt'
			? '/crm/projekte'
			: type === 'vertrag'
				? '/crm/vertraege'
				: type === 'ansprechpartner'
					? '/crm/ansprechpartner'
					: '/crm/termine';
	return `${base}/${entityId}`;
}

function pickLatestDate(...values: Array<string | null | undefined>) {
	const valid = values.filter((value): value is string => typeof value === 'string' && value.trim() !== '');
	return valid.length > 0 ? valid[0] : null;
}

async function loadTermineForKunde(kundenId: string) {
	const orderCandidates = ['datum', 'start_at', 'starts_at', 'termin_at', 'created_at'] as const;
	let lastError: unknown = null;

	for (const orderCol of orderCandidates) {
		const res = await supabase
			.from('termine')
			.select('*')
			.eq('kunden_id', kundenId)
			.order(orderCol, { ascending: true });

		if (!res.error) return res;
		lastError = res.error;

		const msg = (res.error as any)?.message ?? '';
		const isMissingColumn =
			typeof msg === 'string' &&
			(msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist'));

		if (!isMissingColumn) break;
	}

	return { data: null as any, error: lastError as any };
}

async function loadVertraegeForKunde(kundenId: string) {
	return supabase
		.from('vertraege')
		.select('*, kunden(unternehmensname, kundennummer)')
		.eq('kunde_id', kundenId)
		.order('updated_at', { ascending: false });
}

async function loadAnfragenForKunde(kundenId: string) {
	return supabase
		.from('anfragen')
		.select('*, kunden(unternehmensname, kundennummer)')
		.eq('kunden_id', kundenId)
		.order('created_at', { ascending: false });
}

async function loadRechnungenForKunde(kundenId: string): Promise<{ data: Rechnung[]; error: unknown }> {
	try {
		const res = await supabase
			.from('rechnungen')
			.select('*')
			.eq('kunden_id', kundenId)
			.order('created_at', { ascending: false });
		if (res.error) {
			console.warn('Rechnungen load (kunde):', res.error);
			return { data: [], error: res.error };
		}
		return { data: (res.data ?? []) as Rechnung[], error: null };
	} catch (e) {
		console.warn('Rechnungen load (kunde):', e);
		return { data: [], error: e };
	}
}

function toActivityItems(args: {
	projekte: Projekt[];
	ansprechpartner: AnsprechpartnerWithKunde[];
	termine: Termin[];
	vertraege: Vertrag[];
}): ActivityItem[] {
	const projektItems = args.projekte.map((p) => ({
		id: `projekt-${p.id}`,
		type: 'projekt' as const,
		entity_id: p.id,
		href: activityHref('projekt', p.id),
		title: p.name,
		subtitle: p.beschreibung ?? null,
		status: p.status ?? null,
		value: typeof (p as any).wert === 'number' ? (p as any).wert : typeof (p as any).value === 'number' ? (p as any).value : typeof (p as any).betrag === 'number' ? (p as any).betrag : null,
		updated_at: p.updated_at ?? p.created_at ?? null,
		rawDate: p.updated_at ?? p.created_at ?? null
	}));

	const kontaktItems = args.ansprechpartner.map((ap) => ({
		id: `ansprechpartner-${ap.id}`,
		type: 'ansprechpartner' as const,
		entity_id: ap.id,
		href: activityHref('ansprechpartner', ap.id),
		title: [ap.vorname, ap.nachname].filter(Boolean).join(' ') || 'Unbenannt',
		subtitle: [ap.position, ap.email].filter(Boolean).join(' · ') || null,
		status: null,
		value: null,
		updated_at: (ap as any).updated_at ?? null,
		rawDate: (ap as any).updated_at ?? (ap as any).created_at ?? null
	}));

	const terminItems = args.termine.map((t) => ({
		id: `termin-${t.id}`,
		type: 'termin' as const,
		entity_id: t.id,
		href: activityHref('termin', t.id),
		title: t.titel ?? (t as any).title ?? (t as any).name ?? 'Termin',
		subtitle: t.beschreibung ?? (t as any).notes ?? null,
		status: (t as any).status ?? null,
		value: null,
		updated_at: pickLatestDate(t.updated_at ?? null, t.created_at ?? null, t.start_at ?? null, t.starts_at ?? null, t.datum ?? null),
		rawDate: pickLatestDate(t.start_at ?? null, t.starts_at ?? null, t.datum ?? null, t.created_at ?? null)
	}));

	const vertragsItems = args.vertraege.map((v) => ({
		id: `vertrag-${v.id}`,
		type: 'vertrag' as const,
		entity_id: v.id,
		href: activityHref('vertrag', v.id),
		title: v.bezeichnung ?? v.vertragsnummer ?? 'Vertrag',
		subtitle: v.vertragsnummer ?? null,
		status: v.status ?? null,
		value: typeof v.wert === 'number' ? v.wert : null,
		updated_at: v.updated_at ?? v.created_at ?? null,
		rawDate: v.updated_at ?? v.created_at ?? null
	}));

	return [...projektItems, ...kontaktItems, ...terminItems, ...vertragsItems].sort((a, b) => {
		const da = new Date(a.updated_at ?? 0).getTime();
		const db = new Date(b.updated_at ?? 0).getTime();
		return db - da;
	});
}

function sumByStatus(projekte: Projekt[]) {
	const totals = new Map<string, number>();
	for (const projekt of projekte) {
		const status = projekt.status?.trim() || 'Ohne Status';
		const value =
			typeof (projekt as any).wert === 'number'
				? (projekt as any).wert
				: typeof (projekt as any).value === 'number'
					? (projekt as any).value
					: typeof (projekt as any).betrag === 'number'
						? (projekt as any).betrag
						: 0;
		totals.set(status, (totals.get(status) ?? 0) + value);
	}
	return [...totals.entries()]
		.map(([status, value]) => ({ status, value }))
		.sort((a, b) => b.value - a.value);
}

type AnfrageWithKunde = { kunden: { unternehmensname: string; kundennummer: number } | null; [key: string]: unknown };
type VertragWithKunde = Vertrag & { kunden: { unternehmensname: string; kundennummer: number } | null };

export const load: PageLoad = async ({ params }) => {
	const id = params.id;

	const [kundeRes, apRes, projekteRes, termineRes, vertraegeRes, anfragenRes] = await Promise.all([
		supabase.from('kunden').select('*').eq('id', id).single(),
		supabase
			.from('ansprechpartner')
			.select('*, kunden(unternehmensname, kundennummer)')
			.eq('kunden_id', id)
			.order('nachname', { ascending: true }),
		supabase
			.from('projekte')
			.select('*, projekt_bausteine(id)')
			.eq('kunden_id', id)
			.order('created_at', { ascending: false }),
		loadTermineForKunde(id),
		loadVertraegeForKunde(id),
		loadAnfragenForKunde(id)
	]);

	const rechnungenRes = await loadRechnungenForKunde(id);

	const error =
		kundeRes.error?.message ||
		apRes.error?.message ||
		projekteRes.error?.message ||
		(termineRes as any)?.error?.message ||
		(vertraegeRes as any)?.error?.message ||
		anfragenRes.error?.message;

	if (error) {
		console.error('Kunde dashboard load error:', {
			kunde: kundeRes.error,
			ansprechpartner: apRes.error,
			projekte: projekteRes.error,
			termine: (termineRes as any)?.error,
			vertraege: (vertraegeRes as any)?.error,
			anfragen: anfragenRes.error
		});
	}

	const projekte = (projekteRes.data ?? []) as Projekt[];
	const ansprechpartner = (apRes.data ?? []) as AnsprechpartnerWithKunde[];
	const termine = (((termineRes as any)?.data ?? []) as Termin[]) ?? [];
	const vertraege = (((vertraegeRes as any)?.data ?? []) as VertragWithKunde[]) ?? [];
	const anfragen = (anfragenRes.data ?? []) as AnfrageWithKunde[];
	const rechnungen = rechnungenRes.data ?? [];

	return {
		kunde: (kundeRes.data ?? null) as Kunde | null,
		ansprechpartner,
		projekte,
		termine,
		vertraege,
		anfragen,
		rechnungen,
		activities: toActivityItems({ projekte, ansprechpartner, termine, vertraege }),
		funnel: sumByStatus(projekte),
		error: error ?? null
	};
};

