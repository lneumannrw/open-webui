<script lang="ts">
	import { getContext } from 'svelte';
	import type { Kunde } from '$lib/types/kunden';
	import CrmCard from './CrmCard.svelte';
	import UsersSolid from '$lib/components/icons/UsersSolid.svelte';

	export let kunde: Kunde;
	export let onSelect: ((k: Kunde) => void) | undefined = undefined;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	function badgeType(status: Kunde['status']): 'success' | 'info' | 'muted' | 'error' {
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
	title={kunde.unternehmensname}
	badgeContent={i18n.t(kunde.status)}
	badgeType={badgeType(kunde.status)}
	on:click={() => onSelect?.(kunde)}
>
	<svelte:fragment slot="icon">
		<UsersSolid className="size-10" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		{#if kunde.email_zentrale}
			<span class="line-clamp-1">{kunde.email_zentrale}</span>
			<span class="shrink-0">·</span>
		{/if}
		{#if kunde.ort}
			<span class="line-clamp-1">{kunde.ort}</span>
			<span class="shrink-0">·</span>
		{/if}
		<span class="line-clamp-1">{formatDate(kunde.created_at)}</span>
	</svelte:fragment>
</CrmCard>
