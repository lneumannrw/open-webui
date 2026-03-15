/** CRM Ansprechpartner – Supabase-Tabelle `ansprechpartner` mit FK zu kunden */

export interface Ansprechpartner {
	id: string;
	kunden_id: string;
	vorname: string | null;
	nachname: string | null;
	email: string | null;
	telefon: string | null;
	position: string | null;
}

export type AnsprechpartnerInsert = Omit<Ansprechpartner, 'id'> & { id?: string };

export interface AnsprechpartnerWithKunde extends Ansprechpartner {
	kunden: { unternehmensname: string; kundennummer: number } | null;
}
