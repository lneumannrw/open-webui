<script lang="ts">
	import { getContext } from 'svelte';
	import type { Kunde } from '$lib/types/kunden';
	import Badge from '$lib/components/common/Badge.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	export let kunden: Kunde[] = [];

	function statusBadgeType(status: Kunde['status']): string {
		switch (status) {
			case 'Aktiv':
				return 'success';
			case 'Lead':
				return 'info';
			case 'Inaktiv':
				return 'muted';
			case 'Gesperrt':
				return 'error';
			default:
				return 'muted';
		}
	}
</script>

<div class="scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full">
	<table
		class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full"
	>
		<thead class="text-xs text-gray-800 uppercase bg-transparent dark:text-gray-200">
			<tr class="border-b-[1.5px] border-gray-50 dark:border-gray-850/30">
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Nr.')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Unternehmensname')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Status')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('E-Mail')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Telefon')}
				</th>
				<th scope="col" class="px-2.5 py-2">
					{i18n.t('Ort')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each kunden as kunde (kunde.id)}
				<tr class="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs">
					<td class="px-3 py-1 font-medium text-gray-900 dark:text-white">
						{kunde.kundennummer}
					</td>
					<td class="px-3 py-1 font-medium text-gray-900 dark:text-white max-w-48 truncate">
						{kunde.unternehmensname}
					</td>
					<td class="px-3 py-1 min-w-[7rem] w-28">
						<Badge
							type={statusBadgeType(kunde.status)}
							content={i18n.t(kunde.status)}
						/>
					</td>
					<td class="px-3 py-1">{kunde.email_zentrale ?? '–'}</td>
					<td class="px-3 py-1">{kunde.telefon_zentrale ?? '–'}</td>
					<td class="px-3 py-1">{kunde.ort ?? '–'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if kunden.length === 0}
	<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
		{i18n.t('Keine Kunden vorhanden.')}
	</p>
{/if}
