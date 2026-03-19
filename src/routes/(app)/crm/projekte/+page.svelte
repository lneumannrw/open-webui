<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { ProjektWithBausteineCount } from '$lib/types/projekte';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import ProjekteTable from '$lib/components/crm/ProjekteTable.svelte';
	import ProjektCard from '$lib/components/crm/ProjektCard.svelte';
	import ProjektFormModal from '$lib/components/crm/ProjektFormModal.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import CrmSearchFilter from '$lib/components/crm/CrmSearchFilter.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';
	import { crmViewMode } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import { fetchCrmList } from '$lib/utils/crmSearch';

	export let data: PageData;

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

	const PROJEKT_STATUS_OPTIONS = [
		{ value: 'Offen', label: 'Offen' },
		{ value: 'In Arbeit', label: 'In Arbeit' },
		{ value: 'Abgeschlossen', label: 'Abgeschlossen' }
	];

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: hasSearchOrFilter =
		searchValue.trim() !== '' ||
		Object.values(filterValues).some((v) => v != null && v !== '');

	$: if (data?.projekte != null && !hasSearchOrFilter) {
		displayItems = data.projekte;
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
				console.error('Projekte search error:', e);
				toast.error(i18n.t('Suche fehlgeschlagen.'));
				displayItems = [];
			} finally {
				loading = false;
			}
		}, 400);
	}

	$: if (data?.error) {
		toast.error(i18n.t('Projekte konnten nicht geladen werden.') + ' ' + data.error);
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
				console.error('Delete error:', error);
				toast.error(i18n.t('Projekt konnte nicht gelöscht werden.'));
			} else {
				toast.success(i18n.t('Projekt gelöscht.'));
				showDeleteConfirm = false;
				projektToDelete = null;
				await invalidateAll();
			}
		} catch (e) {
			console.error('Delete error:', e);
			toast.error(i18n.t('Projekt konnte nicht gelöscht werden.'));
		} finally {
			deleteLoading = false;
		}
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Projekte')}</h1>
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
</div>

<ConfirmDialog
	bind:show={showDeleteConfirm}
	title={i18n.t('Projekt löschen?')}
	message={i18n.t('Möchten Sie das Projekt „' + (projektToDelete?.name || '') + '" wirklich löschen?')}
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
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4 space-y-3">
		<CrmSearchFilter
			bind:searchValue
			bind:filterValues
			searchPlaceholder={i18n.t('Projekte durchsuchen…')}
			filters={[{ key: 'status', label: i18n.t('Status'), options: PROJEKT_STATUS_OPTIONS }]}
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
						{#each displayItems as projekt (projekt.id)}
							<ProjektCard projekt={projekt} kunden={data.kunden ?? []} onSelect={openEdit} />
						{/each}
					</div>
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Projekte vorhanden.')}
						</p>
					{/if}
				</div>
			{:else}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
				>
					<ProjekteTable projekte={displayItems} kunden={data.kunden ?? []} onRowClick={openEdit} onDelete={openDelete} />
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Projekte vorhanden.')}
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}
