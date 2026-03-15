<script lang="ts">
	import { getContext } from 'svelte';
	import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';
	import CrmCard from './CrmCard.svelte';
	import User from '$lib/components/icons/User.svelte';

	export let ansprechpartner: AnsprechpartnerWithKunde;
	export let onSelect: ((a: AnsprechpartnerWithKunde) => void) | undefined = undefined;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	function displayName(ap: AnsprechpartnerWithKunde): string {
		const v = ap.vorname?.trim() ?? '';
		const n = ap.nachname?.trim() ?? '';
		if (v || n) return `${v} ${n}`.trim();
		return i18n.t('Unbenannt');
	}
</script>

<CrmCard
	title={displayName(ansprechpartner)}
	badgeContent={ansprechpartner.position || ''}
	badgeType="muted"
	on:click={() => onSelect?.(ansprechpartner)}
>
	<svelte:fragment slot="icon">
		<User className="size-10" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		<span class="line-clamp-1">{ansprechpartner.kunden?.unternehmensname ?? '–'}</span>
		{#if ansprechpartner.email}
			<span class="shrink-0">·</span>
			<span class="line-clamp-1">{ansprechpartner.email}</span>
		{/if}
		{#if ansprechpartner.telefon}
			<span class="shrink-0">·</span>
			<span class="line-clamp-1">{ansprechpartner.telefon}</span>
		{/if}
	</svelte:fragment>
</CrmCard>
