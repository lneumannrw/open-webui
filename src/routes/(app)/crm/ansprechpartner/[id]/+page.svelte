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
	import AnsprechpartnerFormModal from '$lib/components/crm/AnsprechpartnerFormModal.svelte';
	import PencilSquare from '$lib/components/icons/PencilSquare.svelte';
	import ChatBubble from '$lib/components/icons/ChatBubble.svelte';
	import Headphone from '$lib/components/icons/Headphone.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';
	import ChevronLeft from '$lib/components/icons/ChevronLeft.svelte';

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

	async function handleDelete() {
		if (!data?.ansprechpartner?.id) return;
		deleteLoading = true;
		const { error } = await supabase
			.from('ansprechpartner')
			.delete()
			.eq('id', data.ansprechpartner.id);
		deleteLoading = false;
		if (error) {
			toast.error(error.message || i18n.t('Fehler beim Löschen.'));
			return;
		}
		toast.success(i18n.t('Ansprechpartner wurde gelöscht.'));
		goto('/crm/ansprechpartner');
	}

	$: ap = data?.ansprechpartner;
	$: kunde = ap?.kunden;
</script>

{#if !data}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else if data?.error && !ap}
	<div class="mt-6 rounded-3xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-6">
		<div class="text-sm font-medium text-red-700 dark:text-red-200">
			{i18n.t('Ansprechpartner konnte nicht geladen werden.')}
		</div>
		<div class="mt-1 text-xs text-red-600/90 dark:text-red-200/70">{data.error}</div>
		<div class="mt-4">
			<button
				class="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition text-sm font-medium"
				on:click={() => goto('/crm/ansprechpartner')}
			>
				{i18n.t('Zurück zur Liste')}
			</button>
		</div>
	</div>
{:else}
	<ConfirmDialog
		bind:show={showDeleteConfirm}
		title={i18n.t('Ansprechpartner löschen?')}
		message={i18n.t('Diese Aktion kann nicht rückgängig gemacht werden.')}
		onConfirm={handleDelete}
		confirmLabel={deleteLoading ? i18n.t('Wird gelöscht...') : i18n.t('Löschen')}
	/>

	<AnsprechpartnerFormModal
		bind:show={showEditModal}
		editItem={ap}
		kunden={data?.kunden ?? []}
		on:save={() => invalidateAll()}
	/>

	<div class="min-h-[calc(100dvh-56px)] pb-10">
		<!-- Header -->
		<div class="flex items-start justify-between gap-4 mb-6">
			<button
				class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
				on:click={() => goto('/crm/ansprechpartner')}
				aria-label={i18n.t('Zurück')}
			>
				<ChevronLeft className="size-5 text-gray-600 dark:text-gray-400" />
			</button>
			<div class="flex-1 min-w-0">
				<h1 class="text-3xl font-semibold text-gray-900 dark:text-gray-100">
					{ap?.vorname || ap?.nachname ? [ap?.vorname, ap?.nachname].filter(Boolean).join(' ') : i18n.t('Unbenannt')}
				</h1>
				{#if ap?.position}
					<p class="mt-1 text-base text-gray-500 dark:text-gray-400">{ap.position}</p>
				{/if}
				{#if kunde}
					<button
						class="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
						on:click={() => goto(`/crm/kunden/${ap?.kunden_id}`)}
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

		<!-- Main grid: profile aside + details -->
		<div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] gap-5">
			<div class="space-y-5">
				<!-- Details Card -->
				<section class="rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-850/70 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
					<div class="px-5 py-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Kontaktinformationen')}</h2>
					</div>
					<div class="px-5 pb-5 space-y-4">
						{#if ap?.email}
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
										{i18n.t('E-Mail')}
									</div>
									<a
										href={`mailto:${ap.email}`}
										class="mt-0.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
									>
										{ap.email}
									</a>
								</div>
							</div>
						{/if}

						{#if ap?.telefon}
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
										{i18n.t('Telefon')}
									</div>
									<a
										href={`tel:${ap.telefon}`}
										class="mt-0.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
									>
										{ap.telefon}
									</a>
								</div>
							</div>
						{/if}

						{#if ap?.position}
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
										{i18n.t('Position')}
									</div>
									<div class="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
										{ap.position}
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
								<!-- Initials Badge -->
								<div
									class="size-16 rounded-[24px] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-md border border-blue-300/50"
								>
									{(ap?.vorname?.[0] ?? '').toUpperCase()}{(ap?.nachname?.[0] ?? '').toUpperCase() || '?'}
								</div>
								<div class="min-w-0 w-full">
									<div class="text-xl font-semibold text-gray-900 dark:text-gray-100">
										{ap?.vorname || ap?.nachname ? [ap?.vorname, ap?.nachname].filter(Boolean).join(' ') : i18n.t('Unbenannt')}
									</div>
									{#if ap?.position}
										<div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{ap.position}</div>
									{/if}
									{#if kunde}
										<div class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
											{kunde.unternehmensname}
										</div>
									{/if}
								</div>
							</div>

							<div class="mt-4 flex flex-wrap justify-center gap-2.5">
								{#if ap?.email}
									<a
										href={`mailto:${ap.email}`}
										class="inline-flex items-center justify-center size-9 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
										aria-label={i18n.t('E-Mail schreiben')}
									>
										<ChatBubble className="size-4" />
									</a>
								{/if}
								{#if ap?.telefon}
									<a
										href={`tel:${ap.telefon}`}
										class="inline-flex items-center justify-center size-9 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
										aria-label={i18n.t('Anrufen')}
									>
										<Headphone className="size-4" />
									</a>
								{/if}
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
												on:click={() => goto(`/crm/kunden/${ap?.kunden_id}`)}
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
