<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { onMount, onDestroy, getContext, createEventDispatcher } from 'svelte';
	import { searchKnowledgeBases } from '$lib/apis/knowledge';
	import { flyAndScale } from '$lib/utils/transitions';
	import { decodeString } from '$lib/utils';
	import Dropdown from '$lib/components/common/Dropdown.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Database from '$lib/components/icons/Database.svelte';

	const i18n = getContext('i18n');
	const dispatch = createEventDispatcher();

	export let onClose: (() => void) | undefined = undefined;

	let show = false;
	let query = '';
	let searchDebounceTimer: ReturnType<typeof setTimeout>;
	let collectionItems: Array<{ id: string; name: string; description?: string }> = [];

	$: if (query !== undefined) {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(() => {
			getItems();
		}, 300);
	}

	onDestroy(() => {
		clearTimeout(searchDebounceTimer);
	});

	async function getItems() {
		const res = await searchKnowledgeBases(localStorage.token, query || null).catch(() => null);
		const items = res?.items ?? (Array.isArray(res) ? res : []);
		collectionItems = items.map((item: { id: string; name?: string; description?: string }) => ({
			id: item.id,
			name: item.name ?? '',
			description: item.description ?? ''
		}));
	}

	onMount(() => {
		getItems();
	});
</script>

<Dropdown
	bind:show
	on:change={(e) => {
		if (e.detail === false) {
			onClose?.();
			query = '';
		}
	}}
>
	<slot />

	<div slot="content">
		<DropdownMenu.Content
			class="z-[10000] text-black dark:text-white rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-850 w-70 p-1.5"
			sideOffset={8}
			side="bottom"
			align="start"
			transition={flyAndScale}
		>
			<div class="flex w-full space-x-2 px-2 pb-0.5">
				<div class="flex flex-1">
					<div class="self-center mr-2">
						<Search className="size-3.5" />
					</div>
					<input
						class="w-full text-sm pr-4 py-1 rounded-r-xl outline-hidden bg-transparent"
						bind:value={query}
						placeholder={$i18n.t('Search')}
					/>
				</div>
			</div>

			<div class="max-h-56 overflow-y-scroll gap-0.5 flex flex-col">
				{#if collectionItems.length === 0}
					<div class="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 pb-6">
						{$i18n.t('No knowledge bases found')}
					</div>
				{:else}
					<div class="px-2 text-xs text-gray-500 py-1">{$i18n.t('Collections')}</div>
					{#each collectionItems as item}
						<div
							class="px-2.5 py-1 rounded-xl w-full text-left flex justify-between items-center text-sm hover:bg-gray-50 hover:dark:bg-gray-800 hover:dark:text-gray-100 cursor-pointer"
						>
							<button
								class="w-full flex-1 text-left"
								type="button"
								on:click={() => {
									dispatch('select', { id: item.id, name: item.name });
									show = false;
								}}
							>
								<div class="text-black dark:text-gray-100 flex items-center gap-1 shrink-0">
									<Database className="size-4 shrink-0" />
									<Tooltip
										content={item.description || decodeString(item.name)}
										placement="top-start"
										tippyOptions={{ zIndex: 100000 }}
									>
										<div class="line-clamp-1 flex-1 text-sm">
											{decodeString(item.name) || $i18n.t('Unbenannt')}
										</div>
									</Tooltip>
								</div>
							</button>
						</div>
					{/each}
				{/if}
			</div>
		</DropdownMenu.Content>
	</div>
</Dropdown>
