/** CRM Rechnungen – Supabase-Tabelle `rechnungen` mit FK zu kunden */

export interface Rechnung {
	id: string;
	kunden_id: string;
	rechnungsnummer: string | null;
	betrag?: number | null;
	betrag_brutto?: number | null;
	status: string | null;
	faellig_am?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	[key: string]: unknown;
}

export type RechnungInsert = Omit<Rechnung, 'id' | 'created_at' | 'updated_at'> & {
	id?: string;
	created_at?: string | null;
	updated_at?: string | null;
};
