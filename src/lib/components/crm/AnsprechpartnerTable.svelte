<script lang="ts">
	import { getContext } from 'svelte';
	import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	export let ansprechpartner: AnsprechpartnerWithKunde[] = [];
	export let onRowClick: ((ap: AnsprechpartnerWithKunde) => void) | undefined = undefined;

	function displayName(ap: AnsprechpartnerWithKunde): string {
		const v = ap.vorname?.trim() ?? '';
		const n = ap.nachname?.trim() ?? '';
		if (v || n) return `${v} ${n}`.trim();
		return '–';
	}
</script>

<div class="scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full">
	<table
		class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full"
	>
		<thead class="text-xs text-gray-800 uppercase bg-transparent dark:text-gray-200">
			<tr class="border-b-[1.5px] border-gray-50 dark:border-gray-850/30">
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Name')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Kunde')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('E-Mail')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Telefon')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Position')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each ansprechpartner as ap (ap.id)}
				<tr
					class="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs {onRowClick
						? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850/50 transition'
						: ''}"
					role={onRowClick ? 'button' : undefined}
					tabindex={onRowClick ? 0 : undefined}
					on:click={onRowClick ? () => onRowClick(ap) : undefined}
					on:keydown={onRowClick
						? (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onRowClick(ap);
								}
							}
						: undefined}
				>
					<td class="px-3 py-1 font-medium text-gray-900 dark:text-white max-w-48 truncate">
						{displayName(ap)}
					</td>
					<td class="px-3 py-1 text-gray-900 dark:text-white max-w-48 truncate">
						{ap.kunden?.unternehmensname ?? '–'}
					</td>
					<td class="px-3 py-1">{ap.email ?? '–'}</td>
					<td class="px-3 py-1">{ap.telefon ?? '–'}</td>
					<td class="px-3 py-1">{ap.position ?? '–'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if ansprechpartner.length === 0}
	<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
		{i18n.t('Keine Ansprechpartner vorhanden.')}
	</p>
{/if}
