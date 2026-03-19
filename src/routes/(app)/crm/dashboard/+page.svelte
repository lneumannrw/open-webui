<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import dayjs from 'dayjs';

	import UsersSolid from '$lib/components/icons/UsersSolid.svelte';
	import QueueList from '$lib/components/icons/QueueList.svelte';
	import Folder from '$lib/components/icons/Folder.svelte';
	import Document from '$lib/components/icons/Document.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';

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

	function relativeTime(iso: string | null): string {
		if (!iso) return '–';
		return dayjs(iso).locale('de').fromNow();
	}

	function daysUntil(dateStr: string): number {
		const end = new Date(dateStr);
		const now = new Date();
		return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
	}

	function activityHref(item: { type: string; id: string }): string {
		const routes: Record<string, string> = {
			kunde: '/crm/kunden/',
			anfrage: '/crm/anfragen/',
			projekt: '/crm/projekte/',
			vertrag: '/crm/vertraege/'
		};
		return (routes[item.type] ?? '/crm/') + item.id;
	}

	function activityTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			kunde: 'Kunde',
			anfrage: 'Anfrage',
			projekt: 'Projekt',
			vertrag: 'Vertrag'
		};
		return labels[type] ?? type;
	}

	const pipelineColors: Record<string, string> = {
		Neu: 'bg-blue-500',
		'In Bearbeitung': 'bg-amber-500',
		Gewonnen: 'bg-emerald-500',
		Verloren: 'bg-red-500',
		Abgebrochen: 'bg-gray-400'
	};
	const pipelineDotColors: Record<string, string> = {
		Neu: 'bg-blue-500',
		'In Bearbeitung': 'bg-amber-500',
		Gewonnen: 'bg-emerald-500',
		Verloren: 'bg-red-500',
		Abgebrochen: 'bg-gray-400'
	};
	const activityDotColors: Record<string, string> = {
		kunde: 'bg-blue-500',
		anfrage: 'bg-amber-500',
		projekt: 'bg-violet-500',
		vertrag: 'bg-emerald-500'
	};

	const projectStatusColors: Record<string, string> = {
		offen: 'bg-blue-500',
		inArbeit: 'bg-amber-500',
		abgeschlossen: 'bg-emerald-500'
	};

	const ps = $derived(data?.projectStatus ?? { offen: 0, inArbeit: 0, abgeschlossen: 0 });
	const psTotal = $derived(ps.offen + ps.inArbeit + ps.abgeschlossen);

	const cardClass =
		'rounded-2xl bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 shadow-xs';
</script>

<div class="flex flex-col gap-6">
	<!-- Sub-Nav -->
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

	<!-- ═══ 1. KPI Header Row ═══ -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Kunden -->
		<div class="{cardClass} p-5">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Kunden')}</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
						{data?.kpi?.kundenTotal ?? 0}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
						{data?.kpi?.kundenLead ?? 0} Leads, {data?.kpi?.kundenAktiv ?? 0} Aktiv
					</p>
				</div>
				<div class="size-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
					<UsersSolid className="size-5" />
				</div>
			</div>
		</div>

		<!-- Offene Anfragen -->
		<div class="{cardClass} p-5">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Offene Anfragen')}</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
						{data?.kpi?.anfragenOffen ?? 0}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Pipeline: {formatCurrency(data?.kpi?.anfragenOffenBudget ?? 0)}
					</p>
				</div>
				<div class="size-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
					<QueueList className="size-5" />
				</div>
			</div>
		</div>

		<!-- Aktive Projekte -->
		<div class="{cardClass} p-5">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Aktive Projekte')}</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
						{data?.projectStatus?.inArbeit ?? 0}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">In Arbeit</p>
				</div>
				<div class="size-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
					<Folder className="size-5" />
				</div>
			</div>
		</div>

		<!-- Vertragsvolumen -->
		<div class="{cardClass} p-5">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Vertragsvolumen')}</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
						{formatCurrency(data?.kpi?.vertragsvolumen ?? 0)}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Laufende Verträge</p>
				</div>
				<div class="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
					<Document className="size-5" />
				</div>
			</div>
		</div>
	</div>

	<!-- ═══ 2. Pipeline + Projektstatus ═══ -->
	<div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] gap-4">
		<!-- Pipeline Overview -->
		<div class="{cardClass} p-5">
			<div class="flex items-baseline justify-between mb-4">
				<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
					{i18n.t('Pipeline')}
				</h2>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					{data?.pipelineTotal ?? 0} Anfragen &middot; {formatCurrency(data?.pipelineTotalBudget ?? 0)}
				</p>
			</div>

			<!-- Segment Bar -->
			{#if (data?.pipelineTotal ?? 0) > 0}
				<div class="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
					{#each data?.pipeline ?? [] as seg}
						{#if seg.count > 0}
							<div
								class="{pipelineColors[seg.status] ?? 'bg-gray-400'} transition-all"
								style="width: {(seg.count / (data?.pipelineTotal ?? 1)) * 100}%"
							></div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="h-3 rounded-full bg-gray-100 dark:bg-gray-800"></div>
			{/if}

			<!-- Legend -->
			<div class="flex flex-wrap gap-x-5 gap-y-2 mt-4">
				{#each data?.pipeline ?? [] as seg}
					<div class="flex items-center gap-2 text-xs">
						<span class="size-2.5 rounded-full {pipelineDotColors[seg.status] ?? 'bg-gray-400'} shrink-0"></span>
						<span class="text-gray-700 dark:text-gray-300">{seg.status}</span>
						<span class="text-gray-500 dark:text-gray-400 font-medium">{seg.count}</span>
						<span class="text-gray-400 dark:text-gray-500">({formatCurrency(seg.budget)})</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Projektstatus -->
		<div class="{cardClass} p-5">
			<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
				{i18n.t('Projektstatus')}
			</h2>

			<div class="space-y-3">
				{#each [
					{ key: 'offen', label: 'Offen', count: ps.offen },
					{ key: 'inArbeit', label: 'In Arbeit', count: ps.inArbeit },
					{ key: 'abgeschlossen', label: 'Abgeschlossen', count: ps.abgeschlossen }
				] as row}
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<span class="size-2.5 rounded-full {projectStatusColors[row.key]} shrink-0"></span>
							<span class="text-gray-700 dark:text-gray-300">{row.label}</span>
						</div>
						<span class="font-medium text-gray-900 dark:text-gray-100">{row.count}</span>
					</div>
				{/each}
			</div>

			<!-- Mini Segment Bar -->
			{#if psTotal > 0}
				<div class="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mt-4">
					{#if ps.offen > 0}
						<div class="bg-blue-500 transition-all" style="width: {(ps.offen / psTotal) * 100}%"></div>
					{/if}
					{#if ps.inArbeit > 0}
						<div class="bg-amber-500 transition-all" style="width: {(ps.inArbeit / psTotal) * 100}%"></div>
					{/if}
					{#if ps.abgeschlossen > 0}
						<div class="bg-emerald-500 transition-all" style="width: {(ps.abgeschlossen / psTotal) * 100}%"></div>
					{/if}
				</div>
			{:else}
				<div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 mt-4"></div>
			{/if}
		</div>
	</div>

	<!-- ═══ 3. Aktivitäten + Auslaufende Verträge ═══ -->
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
		<!-- Letzte Aktivitäten -->
		<div class="{cardClass} p-5">
			<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
				{i18n.t('Letzte Aktivitäten')}
			</h2>
			{#if data?.recentActivity?.length}
				<div class="space-y-1">
					{#each data.recentActivity as item}
						<a
							href={activityHref(item)}
							class="flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition group"
						>
							<span class="size-2 rounded-full {activityDotColors[item.type] ?? 'bg-gray-400'} shrink-0"></span>
							<div class="flex-1 min-w-0">
								<span class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
									{activityTypeLabel(item.type)}
								</span>
								<p class="text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
									{item.label}
								</p>
								{#if item.sublabel}
									<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{item.sublabel}</p>
								{/if}
							</div>
							<span class="text-xs text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap">
								{relativeTime(item.created_at)}
							</span>
						</a>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Aktivitäten.')}</p>
			{/if}
		</div>

		<!-- Auslaufende Verträge -->
		<div class="{cardClass} p-5">
			<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
				{i18n.t('Auslaufende Verträge')}
				<span class="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">90 Tage</span>
			</h2>
			{#if data?.expiringContracts?.length}
				<div class="space-y-3">
					{#each data.expiringContracts as contract}
						{@const days = daysUntil(contract.enddatum)}
						<a
							href="/crm/vertraege/{contract.id}"
							class="flex items-start justify-between gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition group"
						>
							<div class="min-w-0">
								<p class="text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
									{contract.bezeichnung}
								</p>
								{#if contract.vertragsnummer}
									<p class="text-xs text-gray-400 dark:text-gray-500">{contract.vertragsnummer}</p>
								{/if}
								<p class="text-xs text-gray-500 dark:text-gray-400">{contract.kundeName}</p>
							</div>
							<div class="text-right shrink-0">
								<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
									{formatCurrency(contract.wert)}
								</p>
								<p class="text-xs {days < 30 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}">
									{new Date(contract.enddatum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
								</p>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine auslaufenden Verträge.')}</p>
			{/if}
		</div>
	</div>

	<!-- ═══ 4. Quick Actions ═══ -->
	<div class="flex flex-wrap gap-2">
		<a
			href="/crm/kunden"
			class="px-4 py-2 rounded-full text-sm font-medium bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 transition inline-flex items-center gap-1.5"
		>
			<Plus className="size-3.5" />
			{i18n.t('Neuer Kunde')}
		</a>
		<a
			href="/crm/anfragen"
			class="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition inline-flex items-center gap-1.5"
		>
			<Plus className="size-3.5" />
			{i18n.t('Neue Anfrage')}
		</a>
		<a
			href="/crm/projekte"
			class="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition inline-flex items-center gap-1.5"
		>
			<Plus className="size-3.5" />
			{i18n.t('Neues Projekt')}
		</a>
		<a
			href="/crm/vertraege"
			class="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition inline-flex items-center gap-1.5"
		>
			<Plus className="size-3.5" />
			{i18n.t('Neuer Vertrag')}
		</a>
	</div>
</div>
