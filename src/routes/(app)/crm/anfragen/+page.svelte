<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import AnfragenTable from '$lib/components/crm/AnfragenTable.svelte';
	import AnfrageFormModal from '$lib/components/crm/AnfrageFormModal.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';

	export let data: PageData;

	let showModal = false;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	$: if (data?.error) {
		toast.error(i18n.t('Daten konnten nicht geladen werden.') + ' ' + data.error);
	}

	async function handleSave() {
		await invalidateAll();
	}
</script>

<div
	class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between sticky top-0 z-10 bg-white dark:bg-gray-900"
>
	<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
		{i18n.t('Anfragen')}
	</h1>
	<div class="flex gap-1">
		<Tooltip content={i18n.t('Neu')}>
			<button
				class="p-2 rounded-xl hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 transition font-medium text-sm flex items-center space-x-1"
				on:click={() => (showModal = true)}
			>
				<Plus className="size-3.5" />
			</button>
		</Tooltip>
	</div>
</div>

<AnfrageFormModal
	bind:show={showModal}
	kunden={data?.kunden ?? []}
	on:save={handleSave}
/>

{#if !data?.anfragen}
	<div class="my-10">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="mt-4">
		<AnfragenTable anfragen={data.anfragen} />
	</div>
{/if}
