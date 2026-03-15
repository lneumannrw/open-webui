<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Kunde } from '$lib/types/kunden';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import KundenTable from '$lib/components/crm/KundenTable.svelte';
	import KundeFormModal from '$lib/components/crm/KundeFormModal.svelte';
	import KundeCard from '$lib/components/crm/KundeCard.svelte';
	import ViewSwitcher from '$lib/components/crm/ViewSwitcher.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import { crmViewMode } from '$lib/stores';

	export let data: PageData;

	let showKundeModal = false;
	let selectedKunde: Kunde | null = null;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: if (data?.error) {
		toast.error(i18n.t('Kunden konnten nicht geladen werden.') + ' ' + data.error);
	}

	function openNew() {
		selectedKunde = null;
		showKundeModal = true;
	}

	function openEdit(kunde: Kunde) {
		selectedKunde = kunde;
		showKundeModal = true;
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
	<div class="mt-4">
		{#if $crmViewMode === 'gallery'}
			<div
				class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
			>
				<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
					{#each data.kunden as kunde (kunde.id)}
						<KundeCard kunde={kunde} onSelect={openEdit} />
					{/each}
				</div>
				{#if data.kunden.length === 0}
					<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
						{i18n.t('Keine Kunden vorhanden.')}
					</p>
				{/if}
			</div>
		{:else}
			<div
				class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30 px-3"
			>
				<KundenTable kunden={data.kunden} onRowClick={openEdit} />
			</div>
		{/if}
	</div>
{/if}
