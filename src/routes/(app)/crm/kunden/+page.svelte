<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import KundenTable from '$lib/components/crm/KundenTable.svelte';
	import KundeFormModal from '$lib/components/crm/KundeFormModal.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';

	export let data: PageData;

	let showKundeModal = false;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: if (data?.error) {
		toast.error(i18n.t('Kunden konnten nicht geladen werden.') + ' ' + data.error);
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Kunden')}</h1>
	<div class="flex gap-1">
		<Tooltip content={i18n.t('Neuer Kunde')}>
			<button
				class="p-2 rounded-xl hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 transition font-medium text-sm flex items-center space-x-1"
				on:click={() => (showKundeModal = true)}
			>
				<Plus className="size-3.5" />
			</button>
		</Tooltip>
	</div>
</div>

<KundeFormModal bind:show={showKundeModal} on:save={handleSave} />

{#if !data?.kunden}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4">
		<KundenTable kunden={data.kunden} />
	</div>
{/if}
