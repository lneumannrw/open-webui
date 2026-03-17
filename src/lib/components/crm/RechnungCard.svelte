<script lang="ts">
	import { getContext } from 'svelte';
	import type { Rechnung } from '$lib/types/rechnungen';
	import CrmCard from './CrmCard.svelte';
	import Document from '$lib/components/icons/Document.svelte';

	export let rechnung: Rechnung;
	export let onSelect: ((r: Rechnung) => void) | undefined = undefined;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

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

	function formatBetrag(value: number | null | undefined): string {
		if (value == null) return '–';
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 2
		}).format(value);
	}

	$: betrag = rechnung.betrag_brutto ?? rechnung.betrag ?? null;
	$: title = rechnung.rechnungsnummer || i18n.t('Rechnung');
</script>

<CrmCard
	title={title}
	badgeContent={rechnung.status ?? ''}
	badgeType="info"
	on:click={() => onSelect?.(rechnung)}
>
	<svelte:fragment slot="icon">
		<Document className="size-10" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		<span class="line-clamp-1">{formatBetrag(betrag)}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{rechnung.status ?? '–'}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{i18n.t('Fällig')}: {formatDate(rechnung.faellig_am)}</span>
	</svelte:fragment>
</CrmCard>
