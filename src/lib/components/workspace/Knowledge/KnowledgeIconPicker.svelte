<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { getContext } from 'svelte';
	import { flyAndScale } from '$lib/utils/transitions';
	import {
		KNOWLEDGE_ICON_IDS,
		KNOWLEDGE_ICON_MAP,
		DEFAULT_KNOWLEDGE_ICON,
		type KnowledgeIconId
	} from './knowledgeIcons';

	const i18n = getContext('i18n');

	export let selectedId: string | undefined = undefined;
	export let onSelect: (id: string) => void = () => {};
	export let onClose: () => void = () => {};
	export let side: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
	export let align: 'start' | 'center' | 'end' = 'start';

	let open = false;

	function handleSelect(id: KnowledgeIconId) {
		onSelect(id);
		open = false;
		onClose();
	}
</script>

<DropdownMenu.Root
	bind:open
	closeFocus={false}
	onOpenChange={(state) => {
		if (!state) onClose();
	}}
	typeahead={false}
>
	<DropdownMenu.Trigger>
		<slot />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="p-3 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850 rounded-2xl z-9999 shadow-lg"
		sideOffset={8}
		{side}
		{align}
		transition={flyAndScale}
	>
		<div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-0.5">
			{$i18n.t('Choose icon')}
		</div>
		<div class="grid grid-cols-5 gap-2">
			{#each KNOWLEDGE_ICON_IDS as iconId}
				{@const IconComponent = KNOWLEDGE_ICON_MAP[iconId]}
				{#if IconComponent}
					<button
						type="button"
						class="flex items-center justify-center size-10 rounded-xl transition {selectedId === iconId
							? 'bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-400 dark:ring-gray-500'
							: 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
						aria-label={iconId}
						on:click={() => handleSelect(iconId)}
					>
						<svelte:component this={IconComponent} className="size-5" />
					</button>
				{/if}
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
