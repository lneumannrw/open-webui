<script lang="ts">
	import { getContext } from 'svelte';
	import type { Kunde } from '$lib/types/kunden';
	import type { ProjektWithBausteineCount } from '$lib/types/projekte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	export let projekte: ProjektWithBausteineCount[] = [];
	export let kunden: Kunde[] = [];
	export let onRowClick: ((p: ProjektWithBausteineCount) => void) | undefined = undefined;

	function getKundeName(kundeId: string | null): string {
		if (!kundeId) return '–';
		const k = kunden.find((c) => c.id === kundeId);
		return k ? `${k.kundennummer} – ${k.unternehmensname}` : '–';
	}

	function getBausteineCount(projekt: ProjektWithBausteineCount): number {
		const list = projekt.projekt_bausteine;
		return Array.isArray(list) ? list.length : 0;
	}
</script>

<div class="scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full">
	<table
		class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full"
	>
		<thead class="text-xs text-gray-800 uppercase bg-transparent dark:text-gray-200">
			<tr class="border-b-[1.5px] border-gray-50 dark:border-gray-850/30">
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Projektname')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Kunde')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Bausteine')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Beschreibung')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each projekte as projekt (projekt.id)}
				<tr
					class="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs {onRowClick
						? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850/50 transition'
						: ''}"
					role={onRowClick ? 'button' : undefined}
					tabindex={onRowClick ? 0 : undefined}
					on:click={onRowClick ? () => onRowClick(projekt) : undefined}
					on:keydown={onRowClick
						? (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onRowClick(projekt);
								}
							}
						: undefined}
				>
					<td class="px-3 py-1 font-medium text-gray-900 dark:text-white max-w-48 truncate">
						{projekt.name}
					</td>
					<td class="px-3 py-1 text-gray-700 dark:text-gray-300 max-w-48 truncate">
						{getKundeName(projekt.kunden_id)}
					</td>
					<td class="px-3 py-1 text-gray-700 dark:text-gray-300">
						{getBausteineCount(projekt) || '–'}
					</td>
					<td class="px-3 py-1 text-gray-600 dark:text-gray-400 max-w-64 truncate">
						{projekt.beschreibung ?? '–'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if projekte.length === 0}
	<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
		{i18n.t('Keine Projekte vorhanden.')}
	</p>
{/if}
