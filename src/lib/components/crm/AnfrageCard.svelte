<script lang="ts">
	import { getContext } from 'svelte';
	import type { AnfrageWithKunde } from '$lib/types/anfragen';
	import CrmCard from './CrmCard.svelte';
	import QueueList from '$lib/components/icons/QueueList.svelte';

	export let anfrage: AnfrageWithKunde;
	export let onSelect: ((a: AnfrageWithKunde) => void) | undefined = undefined;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	function statusBadgeType(status: AnfrageWithKunde['status']): 'success' | 'error' | 'info' | 'muted' {
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

	function formatDate(iso: string | null | undefined): string {
		if (!iso) return '–';
		try {
			return new Date(iso).toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch {
			return '–';
		}
	}
</script>

<CrmCard
	title={anfrage.titel ?? i18n.t('Ohne Titel')}
	badgeContent={i18n.t(anfrage.status)}
	badgeType={statusBadgeType(anfrage.status)}
	on:click={() => onSelect?.(anfrage)}
>
	<svelte:fragment slot="icon">
		<QueueList className="size-10" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		<span class="line-clamp-1">{anfrage.kunden?.unternehmensname ?? '–'}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{formatBudget(anfrage.budget)}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{formatDate(anfrage.created_at)}</span>
	</svelte:fragment>
</CrmCard>
