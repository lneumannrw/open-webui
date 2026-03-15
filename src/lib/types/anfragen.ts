/** CRM Anfragen – Supabase-Tabelle `anfragen` mit FK zu kunden */

export type AnfrageStatus =
	| 'Neu'
	| 'In Bearbeitung'
	| 'Gewonnen'
	| 'Verloren'
	| 'Abgebrochen';

export interface Anfrage {
	id: string;
	kunden_id: string;
	titel: string | null;
	beschreibung: string | null;
	status: AnfrageStatus;
	budget: number | null;
	created_at?: string;
	updated_at?: string;
}

export type AnfrageInsert = Omit<Anfrage, 'id' | 'created_at' | 'updated_at'> & {
	id?: string;
	created_at?: string;
	updated_at?: string;
};

export interface AnfrageWithKunde extends Anfrage {
	kunden: { unternehmensname: string; kundennummer: number } | null;
}
