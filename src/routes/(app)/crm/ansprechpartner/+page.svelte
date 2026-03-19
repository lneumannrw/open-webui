<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import AnsprechpartnerTable from '$lib/components/crm/AnsprechpartnerTable.svelte';
	import AnsprechpartnerCard from '$lib/components/crm/AnsprechpartnerCard.svelte';
	import AnsprechpartnerFormModal from '$lib/components/crm/AnsprechpartnerFormModal.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import CrmSearchFilter from '$lib/components/crm/CrmSearchFilter.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import { crmViewMode } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import { fetchCrmList } from '$lib/utils/crmSearch';

	export let data: PageData;

	let showModal = false;

	let searchValue = '';
	let filterValues: Record<string, string> = {};
	let displayItems: AnsprechpartnerWithKunde[] = [];
	let loading = false;
	let searchDebounceTimer: ReturnType<typeof setTimeout>;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: hasSearchOrFilter = searchValue.trim() !== '';

	$: if (data?.ansprechpartner != null && !hasSearchOrFilter) {
		displayItems = data.ansprechpartner;
	}

	$: if (hasSearchOrFilter) {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const result = await fetchCrmList<AnsprechpartnerWithKunde>({
					supabase,
					table: 'ansprechpartner',
					select: '*, kunden(unternehmensname, kundennummer)',
					order: { column: 'nachname', ascending: true },
					searchColumns: ['vorname', 'nachname', 'email'],
					searchTerm: searchValue.trim() || undefined
				});
				displayItems = result;
			} catch (e) {
				console.error('Ansprechpartner search error:', e);
				toast.error(i18n.t('Suche fehlgeschlagen.'));
				displayItems = [];
			} finally {
				loading = false;
			}
		}, 400);
	}

	$: if (data?.error) {
		toast.error(i18n.t('Daten konnten nicht geladen werden.') + ' ' + data.error);
	}

	function openNew() {
		showModal = true;
	}

	function openDetail(ap: AnsprechpartnerWithKunde) {
		goto(`/crm/ansprechpartner/${ap.id}`);
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
		{i18n.t('Ansprechpartner')}
	</h1>
	<div class="flex gap-1.5 items-center">
		<ViewSwitcher />
		<button
			class="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-medium text-sm flex items-center gap-1.5"
			on:click={openNew}
		>
			<Plus className="size-3.5" strokeWidth="2.5" />
			<span>{i18n.t('Neuer Ansprechpartner')}</span>
		</button>
	</div>
</div>

<AnsprechpartnerFormModal
	bind:show={showModal}
	editItem={null}
	kunden={data?.kunden ?? []}
	on:save={handleSave}
/>

{#if !data?.ansprechpartner}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4 space-y-3">
		<CrmSearchFilter
			bind:searchValue
			bind:filterValues
			searchPlaceholder={i18n.t('Ansprechpartner durchsuchen…')}
			filters={[]}
		/>
		{#if loading}
			<div class="my-10">
				<Spinner className="size-5" />
			</div>
		{:else}
			{#if $crmViewMode === 'gallery'}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
				>
					<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
						{#each displayItems as ap (ap.id)}
							<button
								class="w-full text-left"
								on:click={() => openDetail(ap)}
							>
								<AnsprechpartnerCard ansprechpartner={ap} />
							</button>
						{/each}
					</div>
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ansprechpartner vorhanden.')}
						</p>
					{/if}
				</div>
			{:else}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
				>
					<AnsprechpartnerTable ansprechpartner={displayItems} onRowClick={openDetail} />
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ansprechpartner vorhanden.')}
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}
