<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Kunde } from '$lib/types/kunden';
	import type { KundeStatus } from '$lib/types/kunden';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import KundenTable from '$lib/components/crm/KundenTable.svelte';
	import KundeFormModal from '$lib/components/crm/KundeFormModal.svelte';
	import KundeCard from '$lib/components/crm/KundeCard.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import CrmSearchFilter from '$lib/components/crm/CrmSearchFilter.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import { crmViewMode } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import { fetchCrmList } from '$lib/utils/crmSearch';

	export let data: PageData;

	let showKundeModal = false;
	let selectedKunde: Kunde | null = null;

	let searchValue = '';
	let filterValues: Record<string, string> = {};
	let displayItems: Kunde[] = [];
	let loading = false;
	let searchDebounceTimer: ReturnType<typeof setTimeout>;

	const KUNDEN_STATUS_OPTIONS: { value: KundeStatus; label: string }[] = [
		{ value: 'Lead', label: 'Lead' },
		{ value: 'Aktiv', label: 'Aktiv' },
		{ value: 'Inaktiv', label: 'Inaktiv' },
		{ value: 'Gesperrt', label: 'Gesperrt' }
	];

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: hasSearchOrFilter =
		searchValue.trim() !== '' ||
		Object.values(filterValues).some((v) => v != null && v !== '');

	$: if (data?.kunden != null && !hasSearchOrFilter) {
		displayItems = data.kunden;
	}

	$: if (hasSearchOrFilter) {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const result = await fetchCrmList<Kunde>({
					supabase,
					table: 'kunden',
					select: '*',
					order: { column: 'kundennummer', ascending: true },
					searchColumns: ['unternehmensname', 'notizen'],
					searchTerm: searchValue.trim() || undefined,
					filters: filterValues
				});
				displayItems = result;
			} catch (e) {
				console.error('Kunden search error:', e);
				toast.error(i18n.t('Suche fehlgeschlagen.'));
				displayItems = [];
			} finally {
				loading = false;
			}
		}, 400);
	}

	$: if (data?.error) {
		toast.error(i18n.t('Kunden konnten nicht geladen werden.') + ' ' + data.error);
	}

	function openNew() {
		selectedKunde = null;
		showKundeModal = true;
	}

	function openEdit(kunde: Kunde) {
		goto(`/crm/kunden/${kunde.id}`);
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Kunden')}</h1>
	<div class="flex gap-1.5 items-center">
		<ViewSwitcher />
		<button
			class="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-medium text-sm flex items-center gap-1.5"
			on:click={openNew}
		>
			<Plus className="size-3.5" strokeWidth="2.5" />
			<span>{i18n.t('Neuer Kunde')}</span>
		</button>
	</div>
</div>

<KundeFormModal bind:show={showKundeModal} editItem={selectedKunde} on:save={handleSave} />

{#if !data?.kunden}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4 space-y-3">
		<CrmSearchFilter
			bind:searchValue
			bind:filterValues
			searchPlaceholder={i18n.t('Kunden durchsuchen…')}
			filters={[{ key: 'status', label: i18n.t('Status'), options: KUNDEN_STATUS_OPTIONS }]}
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
						{#each displayItems as kunde (kunde.id)}
							<KundeCard kunde={kunde} onSelect={openEdit} />
						{/each}
					</div>
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Kunden vorhanden.')}
						</p>
					{/if}
				</div>
			{:else}
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
				>
					<KundenTable kunden={displayItems} onRowClick={openEdit} />
					{#if hasSearchOrFilter && displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Ergebnisse gefunden.')}
						</p>
					{:else if displayItems.length === 0}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Keine Kunden vorhanden.')}
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}
