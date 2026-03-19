<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { VertragWithKunde } from '$lib/types/vertraege';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import VertraegeTable from '$lib/components/crm/VertraegeTable.svelte';
	import VertragCard from '$lib/components/crm/VertragCard.svelte';
	import VertragFormModal from '$lib/components/crm/VertragFormModal.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import CrmSearchFilter from '$lib/components/crm/CrmSearchFilter.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';
	import { crmViewMode } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import { fetchCrmList } from '$lib/utils/crmSearch';

	export let data: PageData;

	let showVertragModal = false;
	let selectedItem: VertragWithKunde | null = null;

	let searchValue = '';
	let filterValues: Record<string, string> = {};
	let displayItems: VertragWithKunde[] = [];
	let loading = false;
	let searchDebounceTimer: ReturnType<typeof setTimeout>;

	let showDeleteConfirm = false;
	let vertragToDelete: VertragWithKunde | null = null;
	let deleteLoading = false;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: hasSearchOrFilter = searchValue.trim() !== '';

	$: if (data?.vertraege != null && !hasSearchOrFilter) {
		displayItems = data.vertraege;
	}

	$: if (hasSearchOrFilter) {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const result = await fetchCrmList<VertragWithKunde>({
					supabase,
					table: 'vertraege',
					select: '*, kunden(unternehmensname, kundennummer)',
					order: { column: 'created_at', ascending: false },
					searchColumns: ['vertragsnummer', 'bezeichnung'],
					searchTerm: searchValue.trim() || undefined
				});
				displayItems = result;
			} catch (e) {
				console.error('Verträge search error:', e);
				toast.error(i18n.t('Suche fehlgeschlagen.'));
				displayItems = [];
			} finally {
				loading = false;
			}
		}, 400);
	}

	$: if (data?.error) {
		toast.error(i18n.t('Verträge konnten nicht geladen werden.') + ' ' + data.error);
	}

	function openNew() {
		selectedItem = null;
		showVertragModal = true;
	}

	function openEdit(v: VertragWithKunde) {
		selectedItem = v;
		showVertragModal = true;
	}

	function openDelete(v: VertragWithKunde) {
		vertragToDelete = v;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!vertragToDelete) return;

		deleteLoading = true;
		try {
			const { error } = await supabase.from('vertraege').delete().eq('id', vertragToDelete.id);

			if (error) {
				console.error('Delete error:', error);
				toast.error(i18n.t('Vertrag konnte nicht gelöscht werden.'));
			} else {
				toast.success(i18n.t('Vertrag erfolgreich gelöscht.'));
				await invalidateAll();
			}
		} catch (e) {
			console.error('Delete error:', e);
			toast.error(i18n.t('Fehler beim Löschen des Vertrags.'));
		} finally {
			deleteLoading = false;
			showDeleteConfirm = false;
			vertragToDelete = null;
		}
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Verträge')}</h1>
	<div class="flex gap-1.5 items-center">
		<ViewSwitcher />
		<button
			class="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-medium text-sm flex items-center gap-1.5"
			on:click={openNew}
		>
			<Plus className="size-3.5" strokeWidth="2.5" />
			<span>{i18n.t('Neuer Vertrag')}</span>
		</button>
	</div>
</div>

<ConfirmDialog
	bind:show={showDeleteConfirm}
	title={i18n.t('Vertrag löschen?')}
	message={i18n.t('Der Vertrag wird unwiederbringlich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.')}
	confirmLabel={i18n.t('Löschen')}
	cancelLabel={i18n.t('Abbrechen')}
	onConfirm={handleDelete}
/>

<VertragFormModal
	bind:show={showVertragModal}
	editItem={selectedItem}
	kunden={data?.kunden ?? []}
	on:save={handleSave}
/>

{#if !data?.vertraege}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4 space-y-3">
		<CrmSearchFilter
			bind:searchValue
			bind:filterValues
			searchPlaceholder={i18n.t('Verträge durchsuchen…')}
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
						{#each displayItems as v (v.id)}
							<VertragCard vertrag={v} onSelect={openEdit} />
						{/each}
					</div>
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Verträge vorhanden.')}
						</p>
					{/if}
				</div>
			{:else}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
				>
					<VertraegeTable vertraege={displayItems} onRowClick={openEdit} onDelete={openDelete} />
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Verträge vorhanden.')}
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}
