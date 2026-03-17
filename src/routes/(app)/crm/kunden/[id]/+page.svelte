<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onDestroy, onMount, getContext } from 'svelte';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { showSidebar } from '$lib/stores';
	import type { AnfrageWithKunde } from '$lib/types/anfragen';
	import type { ProjektWithBausteineCount } from '$lib/types/projekte';
	import type { VertragWithKunde } from '$lib/types/vertraege';
	import type { Rechnung } from '$lib/types/rechnungen';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import KundeFormModal from '$lib/components/crm/KundeFormModal.svelte';
	import AnfrageCard from '$lib/components/crm/AnfrageCard.svelte';
	import AnfragenTable from '$lib/components/crm/AnfragenTable.svelte';
	import AnfrageFormModal from '$lib/components/crm/AnfrageFormModal.svelte';
	import ProjektCard from '$lib/components/crm/ProjektCard.svelte';
	import ProjekteTable from '$lib/components/crm/ProjekteTable.svelte';
	import ProjektFormModal from '$lib/components/crm/ProjektFormModal.svelte';
	import VertragCard from '$lib/components/crm/VertragCard.svelte';
	import VertraegeTable from '$lib/components/crm/VertraegeTable.svelte';
	import VertragFormModal from '$lib/components/crm/VertragFormModal.svelte';
	import RechnungCard from '$lib/components/crm/RechnungCard.svelte';
	import RechnungenTable from '$lib/components/crm/RechnungenTable.svelte';
	import PencilSquare from '$lib/components/icons/PencilSquare.svelte';
	import ChatBubble from '$lib/components/icons/ChatBubble.svelte';
	import Headphone from '$lib/components/icons/Headphone.svelte';
	import Calendar from '$lib/components/icons/Calendar.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Squares2x2 from '$lib/components/icons/Squares2x2.svelte';
	import ListBullet from '$lib/components/icons/ListBullet.svelte';

	export let data: PageData;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	let prevSidebarValue: boolean | null = null;
	let showKundeModal = false;

	let viewModeAnfragen: 'grid' | 'list' = 'grid';
	let viewModeProjekte: 'grid' | 'list' = 'grid';
	let viewModeVertraege: 'grid' | 'list' = 'grid';
	let viewModeRechnungen: 'grid' | 'list' = 'grid';

	let showAnfrageModal = false;
	let showProjektModal = false;
	let showVertragModal = false;
	let selectedAnfrage: AnfrageWithKunde | null = null;
	let selectedProjekt: ProjektWithBausteineCount | null = null;
	let selectedVertrag: VertragWithKunde | null = null;

	function openNewAnfrage() {
		selectedAnfrage = null;
		showAnfrageModal = true;
	}
	function openEditAnfrage(a: AnfrageWithKunde) {
		selectedAnfrage = a;
		showAnfrageModal = true;
	}
	async function handleSaveAnfrage() {
		await invalidateAll();
	}

	function openNewProjekt() {
		selectedProjekt = null;
		showProjektModal = true;
	}
	function openEditProjekt(p: ProjektWithBausteineCount) {
		selectedProjekt = p;
		showProjektModal = true;
	}
	async function handleSaveProjekt() {
		await invalidateAll();
	}

	function openNewVertrag() {
		selectedVertrag = null;
		showVertragModal = true;
	}
	function openEditVertrag(v: VertragWithKunde) {
		selectedVertrag = v;
		showVertragModal = true;
	}
	async function handleSaveVertrag() {
		await invalidateAll();
	}

	function onRechnungAdd() {
		toast.info(i18n.t('Rechnung anlegen – Formular folgt.'));
	}

	onMount(() => {
		prevSidebarValue = get(showSidebar);
		showSidebar.set(false);
	});

	onDestroy(() => {
		if (prevSidebarValue != null) showSidebar.set(prevSidebarValue);
	});

	function formatDateTime(iso?: string | null) {
		if (!iso) return '–';
		try {
			return new Date(iso).toLocaleString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return '–';
		}
	}

	function formatDateOnly(iso?: string | null) {
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

	function primaryTerminDate(t: any): string | null {
		return t?.start_at ?? t?.starts_at ?? t?.datum ?? t?.termin_at ?? t?.created_at ?? null;
	}

	function formatCurrency(value: number | null | undefined) {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(value ?? 0);
	}

	function activityLabel(type: string) {
		return type === 'projekt'
			? i18n.t('Projekt')
			: type === 'ansprechpartner'
				? i18n.t('Ansprechpartner')
				: type === 'vertrag'
					? i18n.t('Vertrag')
					: i18n.t('Termin');
	}

	function activityTone(type: string) {
		return type === 'projekt'
			? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-200'
			: type === 'ansprechpartner'
				? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-200'
				: type === 'vertrag'
					? 'bg-violet-50 border-violet-100 text-violet-700 dark:bg-violet-950/30 dark:border-violet-900/40 dark:text-violet-200'
					: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-200';
	}

	type CalendarDay = {
		date: Date;
		iso: string;
		isCurrentMonth: boolean;
		isToday: boolean;
		events: any[];
	};

	let currentMonth = new Date();

	function monthLabel(d: Date) {
		return d.toLocaleDateString('de-DE', {
			month: 'long',
			year: 'numeric'
		});
	}

	function startOfMonth(d: Date) {
		return new Date(d.getFullYear(), d.getMonth(), 1);
	}

	function addMonths(d: Date, delta: number) {
		return new Date(d.getFullYear(), d.getMonth() + delta, 1);
	}

	function buildCalendarWeeks(month: Date, allEvents: any[]): CalendarDay[][] {
		const monthStart = startOfMonth(month);
		const year = monthStart.getFullYear();
		const monthIndex = monthStart.getMonth();

		const eventsByIso = new Map<string, any[]>();
		for (const ev of allEvents) {
			const primary = primaryTerminDate(ev);
			if (!primary) continue;
			const iso = new Date(primary).toISOString().slice(0, 10);
			if (!eventsByIso.has(iso)) eventsByIso.set(iso, []);
			eventsByIso.get(iso)?.push(ev);
		}

		const firstWeekday = (monthStart.getDay() + 6) % 7; // Montag=0
		const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

		const todayIso = new Date().toISOString().slice(0, 10);

		const weeks: CalendarDay[][] = [];
		let current = new Date(year, monthIndex, 1 - firstWeekday);

		for (let week = 0; week < 6; week++) {
			const weekDays: CalendarDay[] = [];
			for (let i = 0; i < 7; i++) {
				const iso = current.toISOString().slice(0, 10);
				const isCurrentMonth = current.getMonth() === monthIndex;
				const isToday = iso === todayIso;
				weekDays.push({
					date: new Date(current),
					iso,
					isCurrentMonth,
					isToday,
					events: eventsByIso.get(iso) ?? []
				});
				current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
			}
			weeks.push(weekDays);
		}

		return weeks;
	}

	$: kunde = data?.kunde;
	$: projekte = data?.projekte ?? [];
	$: anfragen = data?.anfragen ?? [];
	$: rechnungen = (data?.rechnungen ?? []) as Rechnung[];
	$: termine = (data?.termine ?? []).slice().sort((a: any, b: any) => {
		const da = new Date(primaryTerminDate(a) ?? 0).getTime();
		const db = new Date(primaryTerminDate(b) ?? 0).getTime();
		return da - db;
	});

	$: nextTermin = termine.length > 0 ? termine[0] : null;
	$: activities = data?.activities ?? [];
	$: funnel = data?.funnel ?? [];
	$: funnelMax = Math.max(...funnel.map((entry) => entry.value ?? 0), 1);
	$: calendarWeeks = buildCalendarWeeks(currentMonth, termine);
</script>

{#if !data}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else if data?.error && !kunde}
	<div class="mt-6 rounded-3xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-6">
		<div class="text-sm font-medium text-red-700 dark:text-red-200">
			{i18n.t('Kunde konnte nicht geladen werden.')}
		</div>
		<div class="mt-1 text-xs text-red-600/90 dark:text-red-200/70">{data.error}</div>
		<div class="mt-4">
			<button
				class="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition text-sm font-medium"
				on:click={() => goto('/crm/kunden')}
			>
				{i18n.t('Zurück zur Kundenliste')}
			</button>
		</div>
	</div>
{:else}
	<div class="min-h-[calc(100dvh-56px)] pb-10">
		<KundeFormModal bind:show={showKundeModal} editItem={kunde ?? null} on:save={() => goto(`/crm/kunden/${kunde?.id ?? ''}`, { replaceState: true })} />
		<AnfrageFormModal
			bind:show={showAnfrageModal}
			editItem={selectedAnfrage}
			kunden={kunde ? [kunde] : []}
			defaultKundenId={kunde?.id ?? ''}
			on:save={handleSaveAnfrage}
		/>
		<ProjektFormModal
			bind:show={showProjektModal}
			editItem={selectedProjekt}
			kunden={kunde ? [kunde] : []}
			defaultKundenId={kunde?.id ?? ''}
			on:save={handleSaveProjekt}
		/>
		<VertragFormModal
			bind:show={showVertragModal}
			editItem={selectedVertrag}
			kunden={kunde ? [kunde] : []}
			defaultKundeId={kunde?.id ?? ''}
			on:save={handleSaveVertrag}
		/>

		<div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
			<div class="rounded-[28px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(15,23,42,0.04)]">
				<div class="text-xs text-gray-500 dark:text-gray-400">{i18n.t('Projekte')}</div>
				<div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{projekte.length}</div>
			</div>
			<div class="rounded-[28px] bg-sky-50/80 dark:bg-gray-900 border border-sky-100/70 dark:border-gray-850/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(15,23,42,0.04)]">
				<div class="text-xs text-gray-500 dark:text-gray-400">{i18n.t('Nächster Termin')}</div>
				<div class="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
					{#if nextTermin}
						{formatDateOnly(primaryTerminDate(nextTermin))}
					{:else}
						–
					{/if}
				</div>
				<div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
					{nextTermin?.titel ?? nextTermin?.title ?? nextTermin?.name ?? ''}
				</div>
			</div>
			<div class="rounded-[28px] bg-emerald-50/80 dark:bg-gray-900 border border-emerald-100/70 dark:border-gray-850/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(15,23,42,0.04)]">
				<div class="text-xs text-gray-500 dark:text-gray-400">{i18n.t('Ansprechpartner')}</div>
				<div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
					{data?.ansprechpartner?.length ?? 0}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] gap-5">
			<div class="min-w-0 space-y-5">
				<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
					<div class="px-5 py-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Interaction History')}</h2>
					</div>
					<div class="px-5 pb-5">
						{#if activities.length === 0}
							<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Interaktionen.')}</p>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
								{#each activities as item (item.id)}
									<a
										href={item.href}
										class="block rounded-[26px] border px-4 py-4 bg-gray-50/80 dark:bg-gray-800/60 dark:border-gray-850/70 transition shadow-sm hover:shadow-md hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
										on:click={(e) => {
											e.preventDefault();
											goto(item.href);
										}}
									>
										<div class="flex items-start justify-between gap-3 h-full">
											<div class="min-w-0">
												<div class="flex items-center gap-2">
													<span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium {activityTone(item.type)}">
														{activityLabel(item.type)}
													</span>
													{#if item.status}
														<span class="text-xs text-gray-500 dark:text-gray-400">{item.status}</span>
													{/if}
												</div>
												<div class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
													{item.title}
												</div>
												{#if item.subtitle}
													<div class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
														{item.subtitle}
													</div>
												{/if}
											</div>
											<div class="shrink-0 text-right flex flex-col items-end">
												<div class="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(item.updated_at)}</div>
												{#if item.value != null}
													<div class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.value)}</div>
												{/if}
											</div>
										</div>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</section>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
						<div class="px-5 py-4 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
									{i18n.t('Tasks Schedule')}
								</h2>
							</div>
							<div class="flex items-center gap-1.5">
								<button
									type="button"
									class="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={() => (currentMonth = addMonths(currentMonth, -1))}
									aria-label={i18n.t('Vorheriger Monat')}
								>
									<span class="text-xs">‹</span>
								</button>
								<button
									type="button"
									class="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={() => (currentMonth = addMonths(currentMonth, 1))}
									aria-label={i18n.t('Nächster Monat')}
								>
									<span class="text-xs">›</span>
								</button>
							</div>
						</div>
						<div class="px-5 pb-5 pt-1">
							<div class="flex items-baseline justify-between mb-3">
								<div class="text-base font-semibold text-gray-900 dark:text-gray-100">
									{monthLabel(currentMonth)}
                                </div>
								<button
									type="button"
									class="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
									on:click={() => (currentMonth = new Date())}
								>
									{i18n.t('Heute')}
								</button>
							</div>

							<div class="grid grid-cols-7 gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">
								<span class="text-center">Mo</span>
								<span class="text-center">Di</span>
								<span class="text-center">Mi</span>
								<span class="text-center">Do</span>
								<span class="text-center">Fr</span>
								<span class="text-center">Sa</span>
								<span class="text-center">So</span>
							</div>

							<div class="grid grid-cols-7 gap-1.5">
								{#each calendarWeeks as week}
									{#each week as day (day.iso)}
										<button
											type="button"
											class="group relative aspect-[4/3] rounded-2xl border text-left px-2.5 py-1.5 text-xs transition
												{day.isCurrentMonth
													? 'bg-gray-50/80 dark:bg-gray-800/70 border-gray-100/80 dark:border-gray-850/80 text-gray-900 dark:text-gray-100'
													: 'bg-white dark:bg-gray-900 border-gray-100/40 dark:border-gray-850/40 text-gray-400 dark:text-gray-600'}
												{day.isToday ? ' ring-1 ring-sky-400/70' : ''}"
											on:click={() => goto(`/crm/termine?date=${day.iso}&kunden_id=${kunde?.id ?? ''}`)}
										>
											<div class="flex items-center justify-between gap-1">
												<div class="text-[11px] font-semibold">
													{day.date.getDate()}
												</div>
												{#if day.events.length > 0}
													<span class="inline-flex items-center justify-center rounded-full bg-sky-500/90 text-white text-[10px] px-1.5 py-0.5">
														{day.events.length}
													</span>
												{/if}
											</div>
											{#if day.events.length === 0}
												<div class="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800/80 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition" />
											{:else}
												<div class="mt-2 h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
											{/if}
										</button>
									{/each}
								{/each}
							</div>

							{#if termine.length === 0}
								<p class="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
									{i18n.t('Keine Termine für diesen Monat.')}
								</p>
							{/if}
						</div>
					</section>

					<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
						<div class="px-5 py-4 flex items-center justify-between">
							<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Funnel / Pipeline')}</h2>
						</div>
						<div class="px-5 pb-5">
							{#if funnel.length === 0}
								<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Pipeline-Daten.')}</p>
							{:else}
								<div class="space-y-3">
									{#each funnel as stage, index (stage.status)}
										<div>
											<div class="flex items-center justify-between gap-3 text-sm">
												<div class="min-w-0 font-medium text-gray-900 dark:text-gray-100 truncate">{stage.status}</div>
												<div class="shrink-0 text-gray-700 dark:text-gray-200">{formatCurrency(stage.value)}</div>
											</div>
											<div class="mt-2 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
												<div class="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" style={`width: ${Math.max(8, Math.min(100, (stage.value / funnelMax) * 100))}%`} />
											</div>
											{#if index < funnel.length - 1}
												<div class="mt-3 border-t border-gray-100 dark:border-gray-850" />
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</section>
				</div>

				<div class="flex flex-col gap-6">
					<!-- Anfragen -->
					<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
						<div class="px-5 py-4 flex items-center justify-between">
							<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Anfragen')}</h2>
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-0.5 rounded-xl bg-gray-50 dark:bg-gray-850 p-0.5">
									<button
										class="p-1.5 rounded-lg transition {viewModeAnfragen === 'grid'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('Gallery view')}
										on:click={() => (viewModeAnfragen = 'grid')}
									>
										<Squares2x2 className="size-4" strokeWidth="2" />
									</button>
									<button
										class="p-1.5 rounded-lg transition {viewModeAnfragen === 'list'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('List view')}
										on:click={() => (viewModeAnfragen = 'list')}
									>
										<ListBullet className="size-4" strokeWidth="2" />
									</button>
								</div>
								<button
									type="button"
									class="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={openNewAnfrage}
									aria-label={i18n.t('Neue Anfrage')}
								>
									<Plus className="size-4" strokeWidth="2.5" />
								</button>
							</div>
						</div>
						<div class="px-5 pb-5">
							{#if viewModeAnfragen === 'grid'}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30">
									<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
										{#each anfragen as a (a.id)}
											<AnfrageCard anfrage={a} onSelect={openEditAnfrage} />
										{/each}
									</div>
									{#if anfragen.length === 0}
										<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
											{i18n.t('Keine Anfragen vorhanden.')}
										</p>
									{/if}
								</div>
							{:else}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3">
									<AnfragenTable anfragen={anfragen} onRowClick={openEditAnfrage} />
								</div>
							{/if}
						</div>
					</section>

					<!-- Projekte -->
					<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
						<div class="px-5 py-4 flex items-center justify-between">
							<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Projekte')}</h2>
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-0.5 rounded-xl bg-gray-50 dark:bg-gray-850 p-0.5">
									<button
										class="p-1.5 rounded-lg transition {viewModeProjekte === 'grid'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('Gallery view')}
										on:click={() => (viewModeProjekte = 'grid')}
									>
										<Squares2x2 className="size-4" strokeWidth="2" />
									</button>
									<button
										class="p-1.5 rounded-lg transition {viewModeProjekte === 'list'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('List view')}
										on:click={() => (viewModeProjekte = 'list')}
									>
										<ListBullet className="size-4" strokeWidth="2" />
									</button>
								</div>
								<button
									type="button"
									class="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={openNewProjekt}
									aria-label={i18n.t('Neues Projekt')}
								>
									<Plus className="size-4" strokeWidth="2.5" />
								</button>
							</div>
						</div>
						<div class="px-5 pb-5">
							{#if viewModeProjekte === 'grid'}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30">
									<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
										{#each projekte as projekt (projekt.id)}
											<ProjektCard projekt={projekt} kunden={kunde ? [kunde] : []} onSelect={openEditProjekt} />
										{/each}
									</div>
									{#if projekte.length === 0}
										<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
											{i18n.t('Keine Projekte vorhanden.')}
										</p>
									{/if}
								</div>
							{:else}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3">
									<ProjekteTable projekte={projekte} kunden={kunde ? [kunde] : []} onRowClick={openEditProjekt} />
								</div>
							{/if}
						</div>
					</section>

					<!-- Verträge -->
					<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
						<div class="px-5 py-4 flex items-center justify-between">
							<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Verträge')}</h2>
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-0.5 rounded-xl bg-gray-50 dark:bg-gray-850 p-0.5">
									<button
										class="p-1.5 rounded-lg transition {viewModeVertraege === 'grid'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('Gallery view')}
										on:click={() => (viewModeVertraege = 'grid')}
									>
										<Squares2x2 className="size-4" strokeWidth="2" />
									</button>
									<button
										class="p-1.5 rounded-lg transition {viewModeVertraege === 'list'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('List view')}
										on:click={() => (viewModeVertraege = 'list')}
									>
										<ListBullet className="size-4" strokeWidth="2" />
									</button>
								</div>
								<button
									type="button"
									class="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={openNewVertrag}
									aria-label={i18n.t('Neuer Vertrag')}
								>
									<Plus className="size-4" strokeWidth="2.5" />
								</button>
							</div>
						</div>
						<div class="px-5 pb-5">
							{#if viewModeVertraege === 'grid'}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30">
									<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
										{#each data?.vertraege ?? [] as v (v.id)}
											<VertragCard vertrag={v} onSelect={openEditVertrag} />
										{/each}
									</div>
									{#if (data?.vertraege?.length ?? 0) === 0}
										<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
											{i18n.t('Keine Verträge vorhanden.')}
										</p>
									{/if}
								</div>
							{:else}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3">
									<VertraegeTable vertraege={data?.vertraege ?? []} onRowClick={openEditVertrag} />
								</div>
							{/if}
						</div>
					</section>

					<!-- Rechnungen -->
					<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
						<div class="px-5 py-4 flex items-center justify-between">
							<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Rechnungen')}</h2>
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-0.5 rounded-xl bg-gray-50 dark:bg-gray-850 p-0.5">
									<button
										class="p-1.5 rounded-lg transition {viewModeRechnungen === 'grid'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('Gallery view')}
										on:click={() => (viewModeRechnungen = 'grid')}
									>
										<Squares2x2 className="size-4" strokeWidth="2" />
									</button>
									<button
										class="p-1.5 rounded-lg transition {viewModeRechnungen === 'list'
											? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
										aria-label={i18n.t('List view')}
										on:click={() => (viewModeRechnungen = 'list')}
									>
										<ListBullet className="size-4" strokeWidth="2" />
									</button>
								</div>
								<button
									type="button"
									class="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={onRechnungAdd}
									aria-label={i18n.t('Neue Rechnung')}
								>
									<Plus className="size-4" strokeWidth="2.5" />
								</button>
							</div>
						</div>
						<div class="px-5 pb-5">
							{#if viewModeRechnungen === 'grid'}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30">
									<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
										{#each rechnungen as r (r.id)}
											<RechnungCard rechnung={r} />
										{/each}
									</div>
									{#if rechnungen.length === 0}
										<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
											{i18n.t('Keine Rechnungen vorhanden.')}
										</p>
									{/if}
								</div>
							{:else}
								<div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3">
									<RechnungenTable rechnungen={rechnungen} />
								</div>
							{/if}
						</div>
					</section>
				</div>
			</div>

			<aside class="space-y-5">
				<section class="rounded-[34px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
					<div class="px-5 pt-5 pb-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Kundenprofil')}</h2>
						<button
							class="inline-flex items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 size-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-xs"
							type="button"
							on:click={() => (showKundeModal = true)}
							aria-label={i18n.t('Kunde bearbeiten')}
						>
							<PencilSquare className="size-4" />
						</button>
					</div>
					<div class="px-5 pb-5">
						<div class="rounded-[30px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100/70 dark:border-gray-850/70 p-5">
							<div class="flex flex-col items-center text-center gap-3">
								{#if kunde?.logo_url}
									<img src={kunde.logo_url} alt="" class="size-16 rounded-[24px] object-cover border border-gray-200 dark:border-gray-700 shadow-sm" />
								{:else}
									<div class="size-16 rounded-[24px] bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
								{/if}
								<div class="min-w-0 w-full">
									{#if kunde?.status}
										<div class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium {kunde.status === 'Aktiv'
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
											: kunde.status === 'Lead'
												? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
												: kunde.status === 'Inaktiv'
													? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
													: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}">
											{i18n.t(kunde.status)}
										</div>
									{/if}
									<div class="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
										{kunde?.unternehmensname ?? i18n.t('Kunde')}
									</div>
									<div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
										{i18n.t('Kundennummer')}: <span class="font-medium text-gray-800 dark:text-gray-200">{kunde?.kundennummer ?? '–'}</span>
									</div>
								</div>
							</div>

							<div class="mt-4 flex flex-wrap justify-center gap-2.5">
								{#if kunde?.email_zentrale}
									<a
										href={`mailto:${kunde.email_zentrale}`}
										class="inline-flex items-center justify-center size-9 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
										aria-label={i18n.t('E-Mail schreiben')}
									>
										<ChatBubble className="size-4" />
									</a>
								{/if}
								{#if kunde?.telefon_zentrale}
									<a
										href={`tel:${kunde.telefon_zentrale}`}
										class="inline-flex items-center justify-center size-9 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
										aria-label={i18n.t('Anrufen')}
									>
										<Headphone className="size-4" />
									</a>
								{/if}
								<button
									type="button"
									class="inline-flex items-center justify-center size-9 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
									on:click={() => goto('/crm/dashboard')}
									aria-label={i18n.t('Neuen Termin planen')}
								>
									<Calendar className="size-4" />
								</button>
							</div>
						</div>

						<div class="mt-4 rounded-[30px] bg-white dark:bg-gray-900 border border-gray-100/80 dark:border-gray-850/80 p-5 space-y-3">
							<div class="flex items-center justify-between mb-1.5">
								<h3 class="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
									{i18n.t('Detailed Information')}
								</h3>
								<button
									type="button"
									class="inline-flex items-center justify-center size-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={() => (showKundeModal = true)}
									aria-label={i18n.t('Kundendaten bearbeiten')}
								>
									<PencilSquare className="size-3.5" />
								</button>
							</div>

							<div class="space-y-3">
								<div class="flex items-start justify-between gap-3">
									<div>
										<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
											{i18n.t('E-Mail')}
										</div>
										<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
											{kunde?.email_zentrale ?? '–'}
										</div>
									</div>
								</div>

								<div class="flex items-start justify-between gap-3">
									<div>
										<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
											{i18n.t('Telefon')}
										</div>
										<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
											{kunde?.telefon_zentrale ?? '–'}
										</div>
									</div>
								</div>

								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
											{i18n.t('Adresse')}
										</div>
										<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
											{[kunde?.strasse, [kunde?.plz, kunde?.ort].filter(Boolean).join(' '), kunde?.land].filter((v) => v != null && String(v).trim() !== '').join(', ') || '–'}
										</div>
									</div>
								</div>

								<div class="flex items-start justify-between gap-3">
									<div>
										<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
											{i18n.t('Branche')}
										</div>
										<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
											{kunde?.branche ?? '–'}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section class="rounded-[34px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
					<div class="px-5 py-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Ansprechpartner')}</h2>
					</div>
					<div class="px-5 pb-5">
						{#if (data?.ansprechpartner?.length ?? 0) === 0}
							<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Ansprechpartner.')}</p>
						{:else}
							<div class="space-y-2">
								{#each data.ansprechpartner as ap (ap.id)}
									<div class="rounded-[24px] bg-gray-50 dark:bg-gray-800 border border-gray-100/70 dark:border-gray-850/70 p-4">
										<div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
											{ap.vorname || ap.nachname ? [ap.vorname, ap.nachname].filter(Boolean).join(' ') : i18n.t('Unbenannt')}
										</div>
										{#if ap.position}
											<div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{ap.position}</div>
										{/if}
										<div class="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
											<div>{ap.email ?? '–'}</div>
											<div>{ap.telefon ?? '–'}</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</section>
			</aside>
		</div>
	</div>
{/if}

