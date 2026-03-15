<script lang="ts">
	import { getContext } from 'svelte';
	import type { VertragWithKunde } from '$lib/types/vertraege';
	import CrmCard from './CrmCard.svelte';
	import Document from '$lib/components/icons/Document.svelte';

	export let vertrag: VertragWithKunde;
	export let onSelect: ((v: VertragWithKunde) => void) | undefined = undefined;

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

	function formatWert(wert: number | null | undefined): string {
		if (wert == null) return '–';
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(wert);
	}

	$: title = vertrag.bezeichnung || vertrag.vertragsnummer || i18n.t('Vertrag');
</script>

<CrmCard
	title={title}
	badgeContent=""
	on:click={() => onSelect?.(vertrag)}
>
	<svelte:fragment slot="icon">
		<Document className="size-10" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		<span class="line-clamp-1">{formatWert(vertrag.wert)}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{i18n.t('Ende')}: {formatDate(vertrag.enddatum)}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{vertrag.kunden?.unternehmensname ?? '–'}</span>
	</svelte:fragment>
</CrmCard>
