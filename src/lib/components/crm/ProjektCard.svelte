<script lang="ts">
	import { getContext } from 'svelte';
	import type { Kunde } from '$lib/types/kunden';
	import type { ProjektWithBausteineCount } from '$lib/types/projekte';
	import CrmCard from './CrmCard.svelte';
	import Folder from '$lib/components/icons/Folder.svelte';

	export let projekt: ProjektWithBausteineCount;
	export let kunden: Kunde[] = [];
	export let onSelect: ((p: ProjektWithBausteineCount) => void) | undefined = undefined;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	function getKundeName(kundeId: string | null): string {
		if (!kundeId) return '–';
		const k = kunden.find((c) => c.id === kundeId);
		return k ? k.unternehmensname : '–';
	}

	function getBausteineCount(): number {
		const list = projekt.projekt_bausteine;
		return Array.isArray(list) ? list.length : 0;
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
	title={projekt.name}
	badgeContent={projekt.status || ''}
	badgeType="info"
	on:click={() => onSelect?.(projekt)}
>
	<svelte:fragment slot="icon">
		<Folder className="size-10" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		<span class="line-clamp-1">{getKundeName(projekt.kunden_id)}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{i18n.t('Bausteine')}: {getBausteineCount()}</span>
		<span class="shrink-0">·</span>
		<span class="line-clamp-1">{formatDate(projekt.created_at)}</span>
	</svelte:fragment>
</CrmCard>
