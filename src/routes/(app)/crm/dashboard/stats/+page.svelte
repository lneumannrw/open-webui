<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	const isStats = $derived($page.url.pathname === '/crm/dashboard/stats');

	const bausteineTotal = $derived(data?.bausteineTotal ?? 0);
	const bausteineErledigt = $derived(data?.bausteineErledigt ?? 0);
	const bausteinePercent =
		$derived(bausteineTotal > 0 ? Math.round((bausteineErledigt / bausteineTotal) * 100) : 0);

	const anfragenGewonnen = $derived(data?.anfragenGewonnen ?? 0);
	const anfragenVerloren = $derived(data?.anfragenVerloren ?? 0);
	const anfragenTotal = $derived(anfragenGewonnen + anfragenVerloren);
	const anfragenGewonnenPercent =
		$derived(anfragenTotal > 0 ? Math.round((anfragenGewonnen / anfragenTotal) * 100) : 0);
	const anfragenVerlorenPercent =
		$derived(anfragenTotal > 0 ? Math.round((anfragenVerloren / anfragenTotal) * 100) : 0);

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatMonth(ym: string): string {
		const [y, m] = ym.split('-');
		const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
		return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Sub-Nav: Überblick | Statistiken -->
	<nav class="flex gap-1 text-sm font-medium">
		<a
			href="/crm/dashboard"
			class="min-w-fit p-1.5 rounded-full flex items-center gap-1.5 {!isStats
				? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
				: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition select-none"
			aria-current={!isStats ? 'page' : null}
		>
			{i18n.t('Überblick')}
		</a>
		<a
			href="/crm/dashboard/stats"
			class="min-w-fit p-1.5 rounded-full flex items-center gap-1.5 {isStats
				? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
				: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition select-none"
			aria-current={isStats ? 'page' : null}
		>
			{i18n.t('Statistiken')}
		</a>
	</nav>

	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Statistiken')}</h1>

	<!-- Projekt-Fortschritt -->
	<div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
		<h2 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
			{i18n.t('Projekt-Fortschritt')}
		</h2>
		{#if bausteineTotal > 0}
			<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
				{bausteineErledigt} {i18n.t('erledigt')} / {bausteineTotal} {i18n.t('Bausteine')} ({bausteinePercent}
				%)
			</p>
			<div
				class="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
				role="progressbar"
				aria-valuenow={bausteinePercent}
				aria-valuemin="0"
				aria-valuemax="100"
			>
				<div
					class="h-full rounded-full bg-green-500 dark:bg-green-600 transition-all"
					style="width: {bausteinePercent}%"
				></div>
			</div>
		{:else}
			<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Bausteine vorhanden.')}</p>
		{/if}
	</div>

	<!-- Anfragen-Status: Gewonnen vs. Verloren -->
	<div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
		<h2 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
			{i18n.t('Anfragen-Status')}
		</h2>
		{#if anfragenTotal > 0}
			<div class="flex gap-4 mb-2">
				<span class="text-sm text-gray-600 dark:text-gray-400">
					{i18n.t('Gewonnen')}: {anfragenGewonnen} ({anfragenGewonnenPercent}%)
				</span>
				<span class="text-sm text-gray-600 dark:text-gray-400">
					{i18n.t('Verloren')}: {anfragenVerloren} ({anfragenVerlorenPercent}%)
				</span>
			</div>
			<div
				class="h-4 w-full rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex"
				role="presentation"
			>
				<div
					class="h-full bg-green-500 dark:bg-green-600 transition-all"
					style="width: {anfragenGewonnenPercent}%"
					title={i18n.t('Gewonnen')}
				></div>
				<div
					class="h-full bg-red-500 dark:bg-red-600 transition-all"
					style="width: {anfragenVerlorenPercent}%"
					title={i18n.t('Verloren')}
				></div>
			</div>
		{:else}
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{i18n.t('Keine Anfragen mit Status Gewonnen/Verloren.')}
			</p>
		{/if}
	</div>

	<!-- Umsatz-Vorschau (auslaufende Verträge) -->
	<div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
		<h2 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
			{i18n.t('Umsatz-Vorschau')}
		</h2>
		<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
			{i18n.t('Monatliche Summe der auslaufenden Verträge (nächste 12 Monate)')}
		</p>
		{#if data?.umsatzVorschau?.length}
			<ul class="space-y-2">
				{#each data.umsatzVorschau as item}
					<li
						class="flex justify-between items-center text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
					>
						<span class="text-gray-700 dark:text-gray-300">{formatMonth(item.month)}</span>
						<span class="font-medium text-gray-900 dark:text-gray-100"
							>{formatCurrency(item.sum)}</span
						>
					</li>
				{/each}
			</ul>
			<!-- Optional: einfache Balken pro Monat -->
			<div class="mt-4 flex items-end gap-1 h-24">
				{#each data.umsatzVorschau as item}
					{@const maxSum = Math.max(...data.umsatzVorschau.map((x) => x.sum), 1)}
					{@const heightPercent = (item.sum / maxSum) * 100}
					<div
						class="flex-1 min-w-[24px] rounded-t bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex flex-col justify-end"
						style="height: {heightPercent}%"
						title={formatMonth(item.month) + ': ' + formatCurrency(item.sum)}
					></div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{i18n.t('Keine auslaufenden Verträge in den nächsten 12 Monaten.')}
			</p>
		{/if}
	</div>
</div>
