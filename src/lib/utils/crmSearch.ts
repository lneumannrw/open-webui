/**
 * CRM list search/filter – builds a Supabase query with optional .ilike() search and .eq() filters.
 * Use from CRM page components with client-side supabase; debounce search input in the page.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface CrmSearchParams {
	supabase: SupabaseClient;
	table: string;
	select: string;
	order: { column: string; ascending?: boolean };
	searchColumns?: string[];
	searchTerm?: string;
	filters?: Record<string, string>;
}

/**
 * Runs a Supabase query with optional text search (OR across columns) and equality filters.
 * @returns Fetched rows or throws on error.
 */
export async function fetchCrmList<T = unknown>(params: CrmSearchParams): Promise<T[]> {
	const { supabase, table, select, order, searchColumns, searchTerm, filters } = params;

	let query = supabase
		.from(table)
		.select(select)
		.order(order.column, { ascending: order.ascending ?? true });

	const q = (searchTerm ?? '').trim();
	if (q && searchColumns?.length) {
		const orClause = searchColumns.map((col) => `${col}.ilike.%${q}%`).join(',');
		query = query.or(orClause);
	}

	if (filters) {
		for (const [key, value] of Object.entries(filters)) {
			if (value != null && value !== '') {
				query = query.eq(key, value);
			}
		}
	}

	const { data, error } = await query;
	if (error) throw error;
	return (data ?? []) as T[];
}
