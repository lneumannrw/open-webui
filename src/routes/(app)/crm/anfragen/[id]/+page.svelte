<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onDestroy, onMount, getContext } from 'svelte';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { showSidebar } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import AnfrageFormModal from '$lib/components/crm/AnfrageFormModal.svelte';
	import PencilSquare from '$lib/components/icons/PencilSquare.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';
	import ChevronLeft from '$lib/components/icons/ChevronLeft.svelte';
	import QueueList from '$lib/components/icons/QueueList.svelte';

	export let data: PageData;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	let prevSidebarValue: boolean | null = null;
	let showEditModal = false;
	let showDeleteConfirm = false;
	let deleteLoading = false;

	onMount(() => {
		prevSidebarValue = get(showSidebar);
		showSidebar.set(false);
	});

	onDestroy(() => {
		if (prevSidebarValue != null) showSidebar.set(prevSidebarValue);
	});

	function statusBadgeType(status: string): 'success' | 'error' | 'info' | 'muted' {
		switch (status) {
			case 'Gewonnen':
				return 'success';
			case 'Verloren':
			case 'Abgebrochen':
				return 'error';
			case 'In Bearbeitung':
				return 'info';
			case 'Neu':
			default:
				return 'muted';
		}
	}

	function statusGradient(status: string): string {
		switch (status) {
			case 'Gewonnen':
				return 'from-green-400 to-green-600';
			case 'Verloren':
				return 'from-red-400 to-red-600';
			case 'Abgebrochen':
				return 'from-orange-400 to-orange-600';
			case 'In Bearbeitung':
				return 'from-blue-400 to-blue-600';
			case 'Neu':
			default:
				return 'from-gray-400 to-gray-600';
		}
	}

	function formatBudget(budget: number | null): string {
		if (budget == null) return '–';
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(budget);
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

	async function handleDelete() {
		if (!data?.anfrage?.id) return;
		deleteLoading = true;
		const { error } = await supabase
			.from('anfragen')
			.delete()
			.eq('id', data.anfrage.id);
		deleteLoading = false;
		if (error) {
			toast.error(error.message || i18n.t('Fehler beim Löschen.'));
			return;
		}
		toast.success(i18n.t('Anfrage wurde gelöscht.'));
		goto('/crm/anfragen');
	}

	$: anfrage = data?.anfrage;
	$: kunde = anfrage?.kunden;
</script>

{#if !data}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else if data?.error && !anfrage}
	<div class="mt-6 rounded-3xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-6">
		<div class="text-sm font-medium text-red-700 dark:text-red-200">
			{i18n.t('Anfrage konnte nicht geladen werden.')}
		</div>
		<div class="mt-1 text-xs text-red-600/90 dark:text-red-200/70">{data.error}</div>
		<div class="mt-4">
			<button
				class="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition text-sm font-medium"
				on:click={() => goto('/crm/anfragen')}
			>
				{i18n.t('Zurück zur Liste')}
			</button>
		</div>
	</div>
{:else}
	<ConfirmDialog
		bind:show={showDeleteConfirm}
		title={i18n.t('Anfrage löschen?')}
		message={i18n.t('Diese Aktion kann nicht rückgängig gemacht werden.')}
		onConfirm={handleDelete}
		confirmLabel={deleteLoading ? i18n.t('Wird gelöscht...') : i18n.t('Löschen')}
	/>

	<AnfrageFormModal
		bind:show={showEditModal}
		editItem={anfrage}
		kunden={data?.kunden ?? []}
		on:save={() => invalidateAll()}
	/>

	<div class="min-h-[calc(100dvh-56px)] pb-10">
		<!-- Header -->
		<div class="flex items-start justify-between gap-4 mb-6">
			<button
				class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
				on:click={() => goto('/crm/anfragen')}
				aria-label={i18n.t('Zurück')}
			>
				<ChevronLeft className="size-5 text-gray-600 dark:text-gray-400" />
			</button>
			<div class="flex-1 min-w-0">
				<h1 class="text-3xl font-semibold text-gray-900 dark:text-gray-100">
					{anfrage?.titel ?? i18n.t('Ohne Titel')}
				</h1>
				<p class="mt-1 text-base text-gray-500 dark:text-gray-400">
					{i18n.t(anfrage?.status ?? 'Neu')}
				</p>
				{#if kunde}
					<button
						class="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
						on:click={() => goto(`/crm/kunden/${anfrage?.kunden_id}`)}
					>
						{kunde.unternehmensname}
					</button>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 size-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
					on:click={() => (showEditModal = true)}
					aria-label={i18n.t('Bearbeiten')}
				>
					<PencilSquare className="size-4" />
				</button>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 size-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
					on:click={() => (showDeleteConfirm = true)}
					aria-label={i18n.t('Löschen')}
				>
					<GarbageBin className="size-4" />
				</button>
			</div>
		</div>

		<!-- Main grid: details + profile aside -->
		<div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] gap-5">
			<div class="space-y-5">
				<!-- Details Card -->
				<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
					<div class="px-5 py-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Details')}</h2>
					</div>
					<div class="px-5 pb-5 space-y-4">
						{#if anfrage?.beschreibung}
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
										{i18n.t('Beschreibung')}
									</div>
									<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
										{anfrage.beschreibung}
									</div>
								</div>
							</div>
						{/if}

						<div class="flex items-start justify-between gap-3">
							<div>
								<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
									{i18n.t('Budget')}
								</div>
								<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
									{formatBudget(anfrage?.budget)}
								</div>
							</div>
						</div>

						<div class="flex items-start justify-between gap-3">
							<div>
								<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
									{i18n.t('Status')}
								</div>
								<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
									{i18n.t(anfrage?.status ?? 'Neu')}
								</div>
							</div>
						</div>

						<div class="flex items-start justify-between gap-3">
							<div>
								<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
									{i18n.t('Erstellt')}
								</div>
								<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
									{formatDate(anfrage?.created_at)}
								</div>
							</div>
						</div>

						{#if anfrage?.updated_at}
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
										{i18n.t('Aktualisiert')}
									</div>
									<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
										{formatDate(anfrage.updated_at)}
									</div>
								</div>
							</div>
						{/if}
					</div>
				</section>
			</div>

			<!-- Aside: Profile Card -->
			<aside class="space-y-5">
				<section class="rounded-[34px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
					<div class="px-5 pt-5 pb-4">
						<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Profil')}</h2>
					</div>
					<div class="px-5 pb-5">
						<div class="rounded-[30px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100/70 dark:border-gray-850/70 p-5">
							<div class="flex flex-col items-center text-center gap-3">
								<!-- Status Badge -->
								<div
									class="size-16 rounded-[24px] bg-gradient-to-br {statusGradient(anfrage?.status ?? 'Neu')} flex items-center justify-center text-2xl font-bold text-white shadow-md border border-white/30"
								>
									<QueueList className="size-8" />
								</div>
								<div class="min-w-0 w-full">
									<div class="text-xl font-semibold text-gray-900 dark:text-gray-100">
										{anfrage?.titel ?? i18n.t('Ohne Titel')}
									</div>
									<div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
										{formatBudget(anfrage?.budget)}
									</div>
									{#if anfrage?.status}
										<div class="mt-1 inline-block">
											<span
												class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {statusBadgeType(anfrage.status) === 'success'
													? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
													: statusBadgeType(anfrage.status) === 'error'
														? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
														: statusBadgeType(anfrage.status) === 'info'
															? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
															: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}"
											>
												{i18n.t(anfrage.status)}
											</span>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="mt-4 rounded-[30px] bg-white dark:bg-gray-900 border border-gray-100/80 dark:border-gray-850/80 p-5 space-y-3">
							<div class="flex items-center justify-between mb-1.5">
								<h3 class="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
									{i18n.t('Zugehörigkeit')}
								</h3>
							</div>
							<div class="space-y-2">
								{#if kunde}
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
												{i18n.t('Kunde')}
											</div>
											<button
												class="mt-0.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
												on:click={() => goto(`/crm/kunden/${anfrage?.kunden_id}`)}
											>
												{kunde.unternehmensname}
											</button>
										</div>
									</div>
									<div class="flex items-start justify-between gap-3">
										<div>
											<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
												{i18n.t('Kundennummer')}
											</div>
											<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
												{kunde.kundennummer}
											</div>
										</div>
									</div>
								{:else}
									<p class="text-xs text-gray-500 dark:text-gray-400">{i18n.t('Kein Kunde zugeordnet.')}</p>
								{/if}
							</div>
						</div>
					</div>
				</section>
			</aside>
		</div>
	</div>
{/if}
