<script lang="ts">
	import { getContext } from 'svelte';
	import type { Kunde } from '$lib/types/kunden';
	import CrmCard from './CrmCard.svelte';

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

	function getInitials(name: string): string {
		const n = (name || '').trim();
		if (!n) return '?';
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return n.slice(0, 2).toUpperCase();
	}

	function getInitialsColor(name: string): string {
		let hash = 0;
		for (let i = 0; i < (name || '').length; i++) hash = (hash << 5) - hash + (name || '').charCodeAt(i);
		const hues = ['emerald', 'blue', 'violet', 'amber', 'rose', 'cyan'];
		const idx = Math.abs(hash) % hues.length;
		const map: Record<string, string> = {
			emerald: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
			blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
			violet: 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
			amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
			rose: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
			cyan: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
		};
		return map[hues[idx]] || map.emerald;
	}
</script>

<CrmCard
	title={kunde.unternehmensname}
	badgeContent={i18n.t(kunde.status)}
	badgeType={badgeType(kunde.status)}
	on:click={() => onSelect?.(kunde)}
>
	<svelte:fragment slot="icon">
		<div
			class="size-10 rounded-full overflow-hidden flex shrink-0 items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
			aria-hidden="true"
		>
			{#if kunde.logo_url}
				<img
					src={kunde.logo_url}
					alt=""
					class="size-full object-cover"
				/>
			{:else}
				<span
					class="text-sm font-semibold select-none {getInitialsColor(kunde.unternehmensname ?? '')}"
				>
					{getInitials(kunde.unternehmensname ?? '')}
				</span>
			{/if}
		</div>
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
