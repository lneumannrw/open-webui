<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { AnfrageWithKunde } from '$lib/types/anfragen';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import AnfragenTable from '$lib/components/crm/AnfragenTable.svelte';
	import AnfrageCard from '$lib/components/crm/AnfrageCard.svelte';
	import AnfrageFormModal from '$lib/components/crm/AnfrageFormModal.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import { crmViewMode } from '$lib/stores';

	export let data: PageData;

	let showModal = false;
	let selectedItem: AnfrageWithKunde | null = null;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: if (data?.error) {
		toast.error(i18n.t('Daten konnten nicht geladen werden.') + ' ' + data.error);
	}

	function openNew() {
		selectedItem = null;
		showModal = true;
	}

	function openEdit(a: AnfrageWithKunde) {
		selectedItem = a;
		showModal = true;
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
		{i18n.t('Anfragen')}
	</h1>
	<div class="flex gap-1.5 items-center">
		<ViewSwitcher />
		<button
			class="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-medium text-sm flex items-center gap-1.5"
			on:click={openNew}
		>
			<Plus className="size-3.5" strokeWidth="2.5" />
			<span>{i18n.t('Neue Anfrage')}</span>
		</button>
	</div>
</div>

<AnfrageFormModal
	bind:show={showModal}
	editItem={selectedItem}
	kunden={data?.kunden ?? []}
	on:save={handleSave}
/>

{#if !data?.anfragen}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4">
		{#if $crmViewMode === 'gallery'}
			<div
				class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
			>
				<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
					{#each data.anfragen as a (a.id)}
						<AnfrageCard anfrage={a} onSelect={openEdit} />
					{/each}
				</div>
				{#if data.anfragen.length === 0}
					<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
						{i18n.t('Keine Anfragen vorhanden.')}
					</p>
				{/if}
			</div>
		{:else}
			<div
				class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
			>
				<AnfragenTable anfragen={data.anfragen} onRowClick={openEdit} />
			</div>
		{/if}
	</div>
{/if}
