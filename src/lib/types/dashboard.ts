/** Dashboard QuickLinks – abgestimmt auf Supabase-Tabelle `app.dashboard_links` */

export interface DashboardLink {
	id: string;
	label: string;
	url: string;
	icon: string | null;
	sort_order: number;
}

export type DashboardLinkInsert = Omit<DashboardLink, 'id'> & { id?: string };
