<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { ProjektWithBausteineCount, ProjektBausteinWithProjekt } from '$lib/types/projekte';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import ProjekteTable from '$lib/components/crm/ProjekteTable.svelte';
	import ProjektCard from '$lib/components/crm/ProjektCard.svelte';
	import ProjektFormModal from '$lib/components/crm/ProjektFormModal.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import CrmSearchFilter from '$lib/components/crm/CrmSearchFilter.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import { crmViewMode } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import { fetchCrmList } from '$lib/utils/crmSearch';

	export let data: PageData;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	let activeTab: 'projekte' | 'bausteine' = 'projekte';

	// Projekte-Tab state
	let showProjektModal = false;
	let selectedItem: ProjektWithBausteineCount | null = null;
	let showDeleteConfirm = false;
	let projektToDelete: ProjektWithBausteineCount | null = null;
	let deleteLoading = false;

	let searchValue = '';
	let filterValues: Record<string, string> = {};
	let displayItems: ProjektWithBausteineCount[] = [];
	let loading = false;
	let searchDebounceTimer: ReturnType<typeof setTimeout>;

	// Bausteine-Tab state
	let bausteinSearch = '';
	let displayBausteine: ProjektBausteinWithProjekt[] = [];

	const PROJEKT_STATUS_OPTIONS = [
		{ value: 'Offen', label: 'Offen' },
		{ value: 'In Arbeit', label: 'In Arbeit' },
		{ value: 'Abgeschlossen', label: 'Abgeschlossen' }
	];

	$: hasSearchOrFilter =
		searchValue.trim() !== '' ||
		Object.values(filterValues).some((v) => v != null && v !== '');

	$: if (data?.projekte != null && !hasSearchOrFilter) {
		displayItems = data.projekte;
	}

	$: if (data?.bausteine != null) {
		displayBausteine = bausteinSearch.trim()
			? data.bausteine.filter(
					(b) =>
						b.name.toLowerCase().includes(bausteinSearch.toLowerCase()) ||
						(b.beschreibung ?? '').toLowerCase().includes(bausteinSearch.toLowerCase()) ||
						(b.projekte?.name ?? '').toLowerCase().includes(bausteinSearch.toLowerCase())
				)
			: data.bausteine;
	}

	$: if (hasSearchOrFilter) {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const result = await fetchCrmList<ProjektWithBausteineCount>({
					supabase,
					table: 'projekte',
					select: '*, projekt_bausteine(id)',
					order: { column: 'created_at', ascending: false },
					searchColumns: ['name', 'beschreibung'],
					searchTerm: searchValue.trim() || undefined,
					filters: filterValues
				});
				displayItems = result;
			} catch (e) {
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
		selectedItem = null;
		showProjektModal = true;
	}

	function openEdit(p: ProjektWithBausteineCount) {
		selectedItem = p;
		showProjektModal = true;
	}

	function openDelete(p: ProjektWithBausteineCount) {
		projektToDelete = p;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!projektToDelete) return;
		deleteLoading = true;
		try {
			const { error } = await supabase.from('projekte').delete().eq('id', projektToDelete.id);
			if (error) {
				toast.error(i18n.t('Projekt konnte nicht gelöscht werden.'));
			} else {
				toast.success(i18n.t('Projekt gelöscht.'));
				showDeleteConfirm = false;
				projektToDelete = null;
				await invalidateAll();
			}
		} catch (e) {
			toast.error(i18n.t('Projekt konnte nicht gelöscht werden.'));
		} finally {
			deleteLoading = false;
		}
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<!-- Tab Navigation -->
<div
	class="pt-0.5 pb-1 gap-3 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<div class="flex items-center gap-1 border-b border-gray-100 dark:border-gray-800 w-full md:w-auto">
		<button
			class="px-3 py-2 text-sm font-medium transition border-b-2 {activeTab === 'projekte'
				? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
				: 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'}"
			on:click={() => (activeTab = 'projekte')}
		>
			{i18n.t('Projekte')}
		</button>
		<button
			class="px-3 py-2 text-sm font-medium transition border-b-2 {activeTab === 'bausteine'
				? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
				: 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'}"
			on:click={() => (activeTab = 'bausteine')}
		>
			{i18n.t('Projekt-Bausteine')}
		</button>
	</div>

	{#if activeTab === 'projekte'}
		<div class="flex gap-1.5 items-center">
			<ViewSwitcher />
			<button
				class="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-medium text-sm flex items-center gap-1.5"
				on:click={openNew}
			>
				<Plus className="size-3.5" strokeWidth="2.5" />
				<span>{i18n.t('Neues Projekt')}</span>
			</button>
		</div>
	{/if}
</div>

<!-- Projekte Tab -->
{#if activeTab === 'projekte'}
	<ConfirmDialog
		bind:show={showDeleteConfirm}
		title={i18n.t('Projekt löschen?')}
		message={i18n.t(
			'Möchten Sie das Projekt „' + (projektToDelete?.name || '') + '" wirklich löschen?'
		)}
		confirmText={i18n.t('Löschen')}
		cancelText={i18n.t('Abbrechen')}
		isDangerous={true}
		loading={deleteLoading}
		on:confirm={handleDelete}
	/>

	<ProjektFormModal
		bind:show={showProjektModal}
		editItem={selectedItem}
		kunden={data?.kunden ?? []}
		on:save={handleSave}
	/>

	{#if !data?.projekte}
		<div class="my-10"><Spinner className="size-5" /></div>
	{:else}
		<div class="mt-4 space-y-3">
			<CrmSearchFilter
				bind:searchValue
				bind:filterValues
				searchPlaceholder={i18n.t('Projekte durchsuchen…')}
				filters={[{ key: 'status', label: i18n.t('Status'), options: PROJEKT_STATUS_OPTIONS }]}
			/>
			{#if loading}
				<div class="my-10"><Spinner className="size-5" /></div>
			{:else if $crmViewMode === 'gallery'}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
				>
					<div
						class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2"
					>
						{#each displayItems as projekt (projekt.id)}
							<ProjektCard projekt={projekt} kunden={data.kunden ?? []} onSelect={openEdit} />
						{/each}
					</div>
					{#if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{hasSearchOrFilter
								? i18n.t('Keine Ergebnisse gefunden.')
								: i18n.t('Keine Projekte vorhanden.')}
						</p>
					{/if}
				</div>
			{:else}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
				>
					<ProjekteTable
						projekte={displayItems}
						kunden={data.kunden ?? []}
						onRowClick={openEdit}
						onDelete={openDelete}
					/>
					{#if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{hasSearchOrFilter
								? i18n.t('Keine Ergebnisse gefunden.')
								: i18n.t('Keine Projekte vorhanden.')}
						</p>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

<!-- Projekt-Bausteine Tab -->
{:else}
	<div class="mt-4 space-y-3">
		<div class="flex items-center gap-2">
			<input
				type="text"
				class="flex-1 max-w-sm px-3 py-1.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
				placeholder={i18n.t('Bausteine durchsuchen…')}
				bind:value={bausteinSearch}
			/>
		</div>

		{#if !data?.bausteine}
			<div class="my-10"><Spinner className="size-5" /></div>
		{:else}
			<div
				class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
			>
				{#if displayBausteine.length === 0}
					<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
						{bausteinSearch.trim()
							? i18n.t('Keine Ergebnisse gefunden.')
							: i18n.t('Keine Bausteine vorhanden.')}
					</p>
				{:else}
					<table class="w-full text-sm">
						<thead>
							<tr
								class="border-b border-gray-100 dark:border-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
							>
								<th class="py-2.5 px-3">{i18n.t('Baustein')}</th>
								<th class="py-2.5 px-3">{i18n.t('Projekt')}</th>
								<th class="py-2.5 px-3 hidden md:table-cell">{i18n.t('Beschreibung')}</th>
							</tr>
						</thead>
						<tbody>
							{#each displayBausteine as baustein (baustein.id)}
								<tr
									class="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-850/50 transition"
								>
									<td class="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100">
										{baustein.name}
									</td>
									<td class="py-2.5 px-3 text-gray-600 dark:text-gray-400">
										{baustein.projekte?.name ?? '—'}
									</td>
									<td
										class="py-2.5 px-3 text-gray-500 dark:text-gray-500 hidden md:table-cell max-w-xs truncate"
									>
										{baustein.beschreibung ?? '—'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		{/if}
	</div>
{/if}
