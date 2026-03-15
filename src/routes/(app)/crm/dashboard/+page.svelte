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

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatActivityDate(iso: string | null): string {
		if (!iso) return '–';
		try {
			return new Date(iso).toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch {
			return iso;
		}
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

	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Dashboard')}</h1>

	<!-- KPI-Karten -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div
			class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
		>
			<div class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Gesamtkunden')}</div>
			<div class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
				{data?.kpi?.kundenTotal ?? 0}
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
				{data?.kpi?.kundenLead ?? 0} {i18n.t('Leads')}, {data?.kpi?.kundenAktiv ?? 0}{' '}
				{i18n.t('Aktiv')}
			</div>
		</div>
		<div
			class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
		>
			<div class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Offene Projekte')}</div>
			<div class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
				{data?.kpi?.projekteInArbeit ?? 0}
			</div>
		</div>
		<div
			class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
		>
			<div class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Pipeline-Wert')}</div>
			<div class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
				{formatCurrency(data?.kpi?.pipelineWert ?? 0)}
			</div>
		</div>
		<div
			class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
		>
			<div class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Vertragsvolumen')}</div>
			<div class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
				{formatCurrency(data?.kpi?.vertragsvolumen ?? 0)}
			</div>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
		<h2 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
			{i18n.t('Recent Activity')}
		</h2>
		{#if data?.recentActivity?.length}
			<ul class="space-y-2">
				{#each data.recentActivity as item}
					<li class="flex justify-between items-center text-sm">
						<span class="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
							{item.type === 'kunde' ? i18n.t('Kunde') : i18n.t('Projekt')}: {item.label}
						</span>
						<span class="text-gray-500 dark:text-gray-400 shrink-0">
							{formatActivityDate(item.created_at)}
						</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Aktivitäten.')}</p>
		{/if}
	</div>

	<!-- Quick Actions -->
	<div class="flex flex-wrap gap-2">
		<a
			href="/crm/kunden"
			class="px-4 py-2 rounded-full text-sm font-medium bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
		>
			{i18n.t('Neuer Kunde')}
		</a>
		<a
			href="/crm/projekte"
			class="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition"
		>
			{i18n.t('Neues Projekt')}
		</a>
	</div>
</div>
