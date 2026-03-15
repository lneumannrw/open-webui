/** CRM Kunden – abgestimmt auf Supabase-Tabelle `kunden` */

export type KundeStatus = 'Lead' | 'Aktiv' | 'Inaktiv' | 'Gesperrt';

export type KundeRechtsform =
	| 'GmbH'
	| 'AG'
	| 'Einzelunternehmen'
	| 'GbR'
	| 'OHG'
	| 'KG'
	| 'e.K.'
	| string;

export interface Kunde {
	id: string;
	kundennummer: number;
	unternehmensname: string;
	rechtsform: KundeRechtsform | null;
	status: KundeStatus;
	email_zentrale: string | null;
	telefon_zentrale: string | null;
	website: string | null;
	strasse: string | null;
	plz: string | null;
	ort: string | null;
	land: string | null;
	branche: string | null;
	notizen: string | null;
	/** Interne Notizen (Supabase), debounced auto-save */
	interne_notizen?: string | null;
	/** Verknüpfte WebUI-Notizen (IDs) */
	linked_webui_notes_ids?: string[] | null;
	/** Verknüpfte Wissensspeicher (Knowledge Collection IDs) */
	knowledge_collection_ids?: string[] | null;
	/** Logo URL nach Upload in Supabase Storage */
	logo_url?: string | null;
	created_at: string;
	updated_at: string;
}

export type KundeInsert = Omit<
	Kunde,
	'id' | 'kundennummer' | 'created_at' | 'updated_at'
> & {
	id?: string;
	kundennummer?: number;
	created_at?: string;
	updated_at?: string;
};
