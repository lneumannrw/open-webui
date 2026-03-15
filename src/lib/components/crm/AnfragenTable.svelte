<script lang="ts">
	import { getContext } from 'svelte';
	import type { AnfrageWithKunde } from '$lib/types/anfragen';
	import Badge from '$lib/components/common/Badge.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	export let anfragen: AnfrageWithKunde[] = [];
	export let onRowClick: ((a: AnfrageWithKunde) => void) | undefined = undefined;

	function statusBadgeType(status: AnfrageWithKunde['status']): string {
		switch (status) {
			case 'Gewonnen':
				return 'success';
			case 'Verloren':
			case 'Abgebrochen':
				return 'error';
			case 'In Bearbeitung':
				return 'info';
			case 'Neu':
			default:
				return 'muted';
		}
	}

	function formatBudget(budget: number | null): string {
		if (budget == null) return '–';
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(budget);
	}
</script>

<div class="scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full">
	<table
		class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full"
	>
		<thead class="text-xs text-gray-800 uppercase bg-transparent dark:text-gray-200">
			<tr class="border-b-[1.5px] border-gray-50 dark:border-gray-850/30">
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Titel')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Kunde')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Status')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Budget')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Beschreibung')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each anfragen as a (a.id)}
				<tr
					class="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs {onRowClick
						? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850/50 transition'
						: ''}"
					role={onRowClick ? 'button' : undefined}
					tabindex={onRowClick ? 0 : undefined}
					on:click={onRowClick ? () => onRowClick(a) : undefined}
					on:keydown={onRowClick
						? (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onRowClick(a);
								}
							}
						: undefined}
				>
					<td class="px-3 py-1 font-medium text-gray-900 dark:text-white max-w-48 truncate">
						{a.titel ?? '–'}
					</td>
					<td class="px-3 py-1 text-gray-900 dark:text-white max-w-48 truncate">
						{a.kunden?.unternehmensname ?? '–'}
					</td>
					<td class="px-3 py-1 min-w-[7rem] w-28">
						<Badge
							type={statusBadgeType(a.status)}
							content={i18n.t(a.status)}
						/>
					</td>
					<td class="px-3 py-1">{formatBudget(a.budget)}</td>
					<td class="px-3 py-1 max-w-64 truncate">
						{a.beschreibung ?? '–'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if anfragen.length === 0}
	<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
		{i18n.t('Keine Anfragen vorhanden.')}
	</p>
{/if}
