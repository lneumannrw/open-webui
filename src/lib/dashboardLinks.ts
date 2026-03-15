/**
 * API for app.dashboard_links (Supabase schema 'app').
 * All calls use supabaseApp to target app.dashboard_links.
 */

import { supabaseApp } from '$lib/supabaseClient';
import type { DashboardLink, DashboardLinkInsert } from '$lib/types/dashboard';

const TABLE = 'dashboard_links';

export async function fetchDashboardLinks(): Promise<DashboardLink[]> {
	const { data, error } = await supabaseApp
		.from(TABLE)
		.select('*')
		.order('sort_order', { ascending: true });

	if (error) throw error;
	return (data ?? []) as DashboardLink[];
}

export async function createDashboardLink(
	payload: Omit<DashboardLinkInsert, 'id'>
): Promise<DashboardLink> {
	const { data, error } = await supabaseApp.from(TABLE).insert(payload).select().single();
	if (error) throw error;
	return data as DashboardLink;
}

export async function updateDashboardLink(
	id: string,
	payload: Partial<Omit<DashboardLink, 'id'>>
): Promise<DashboardLink> {
	const { data, error } = await supabaseApp.from(TABLE).update(payload).eq('id', id).select().single();
	if (error) throw error;
	return data as DashboardLink;
}

export async function deleteDashboardLink(id: string): Promise<void> {
	const { error } = await supabaseApp.from(TABLE).delete().eq('id', id);
	if (error) throw error;
}
