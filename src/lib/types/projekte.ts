/** CRM Projekte & Bausteine – Supabase-Tabellen `projekte`, `projekt_bausteine` */

export interface ProjektBaustein {
	id: string;
	projekt_id: string;
	name: string;
	beschreibung: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface Projekt {
	id: string;
	kunden_id: string | null;
	status: string | null;
	name: string;
	beschreibung: string | null;
	created_at: string;
	updated_at: string;
}

export type ProjektInsert = Omit<Projekt, 'id' | 'created_at' | 'updated_at'> & {
	id?: string;
	created_at?: string;
	updated_at?: string;
};

export type ProjektBausteinInsert = Omit<ProjektBaustein, 'id' | 'created_at' | 'updated_at'> & {
	id?: string;
	created_at?: string;
	updated_at?: string;
};

/** Projekt mit eingebetteten Bausteine-IDs für Zählung (Server-Select: projekt_bausteine(id)) */
export interface ProjektWithBausteineCount extends Projekt {
	projekt_bausteine?: { id: string }[];
}

/** Projekt mit Kunden-Join für Anzeige (optional) */
export interface ProjektWithKunde extends Projekt {
	kunden?: { unternehmensname: string; kundennummer: number } | null;
}

/** Baustein mit eingebettetem Projekt-Namen für Übersichtsseite */
export interface ProjektBausteinWithProjekt extends ProjektBaustein {
	projekte?: { id: string; name: string } | null;
}
