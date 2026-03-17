<script lang="ts">
	import { getContext } from 'svelte';
	import type { Rechnung } from '$lib/types/rechnungen';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	export let rechnungen: Rechnung[] = [];
	export let onRowClick: ((r: Rechnung) => void) | undefined = undefined;

	function formatDate(iso: string | null | undefined): string {
		if (!iso) return '–';
		try {
			return new Date(iso).toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch {
			return iso ?? '–';
		}
	}

	function formatBetrag(value: number | null | undefined): string {
		if (value == null) return '–';
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 2
		}).format(value);
	}
</script>

<div class="scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full">
	<table
		class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full"
	>
		<thead class="text-xs text-gray-800 uppercase bg-transparent dark:text-gray-200">
			<tr class="border-b-[1.5px] border-gray-50 dark:border-gray-850/30">
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Rechnungsnummer')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Betrag')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Status')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Fällig')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each rechnungen as r (r.id)}
				<tr
					class="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs {onRowClick
						? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850/50 transition'
						: ''}"
					role={onRowClick ? 'button' : undefined}
					tabindex={onRowClick ? 0 : undefined}
					on:click={onRowClick ? () => onRowClick(r) : undefined}
					on:keydown={onRowClick
						? (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onRowClick(r);
								}
							}
						: undefined}
				>
					<td class="px-3 py-1 font-medium text-gray-900 dark:text-white">
						{r.rechnungsnummer ?? '–'}
					</td>
					<td class="px-3 py-1 text-gray-700 dark:text-gray-300">
						{formatBetrag(r.betrag_brutto ?? r.betrag)}
					</td>
					<td class="px-3 py-1 text-gray-700 dark:text-gray-300">
						{r.status ?? '–'}
					</td>
					<td class="px-3 py-1 text-gray-600 dark:text-gray-400">
						{formatDate(r.faellig_am)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if rechnungen.length === 0}
	<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
		{i18n.t('Keine Rechnungen vorhanden.')}
	</p>
{/if}
