/** CRM Verträge – Supabase-Tabelle `vertraege` mit FK zu kunden */

export interface Vertrag {
	id: string;
	kunde_id: string;
	vertragsnummer: string | null;
	bezeichnung: string | null;
	wert: number | null;
	startdatum: string | null;
	enddatum: string | null;
	created_at?: string;
	updated_at?: string;
}

export type VertragInsert = Omit<Vertrag, 'id' | 'created_at' | 'updated_at'> & {
	id?: string;
	created_at?: string;
	updated_at?: string;
};

export interface VertragWithKunde extends Vertrag {
	kunden: { unternehmensname: string; kundennummer: number } | null;
}
