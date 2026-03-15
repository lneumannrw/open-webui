<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Badge from '$lib/components/common/Badge.svelte';

	export let title = '';
	/** Optional badge content; if empty, badge slot is not shown */
	export let badgeContent = '';
	export let badgeType: 'info' | 'success' | 'warning' | 'error' | 'muted' = 'info';

	const dispatch = createEventDispatcher();
</script>

<button
	type="button"
	class="relative flex flex-col items-start gap-3 w-full p-4 text-left rounded-2xl transition dark:hover:bg-gray-850/50 hover:bg-gray-50 cursor-pointer"
	on:click={() => dispatch('click')}
>
	<!-- Optional top-right slot (e.g. actions) -->
	{#if $$slots.actions}
		<div class="absolute right-4 top-4 flex items-center gap-2" on:click|stopPropagation>
			<slot name="actions" />
		</div>
	{/if}

	<div class="flex flex-col items-start gap-2 w-full min-w-0 min-h-0 {$$slots.actions ? 'pr-20' : ''}">
		{#if $$slots.icon}
			<span class="flex shrink-0 text-gray-600 dark:text-gray-400" aria-hidden="true">
				<slot name="icon" />
			</span>
		{/if}

		{#if badgeContent}
			<Badge type={badgeType} content={badgeContent} />
		{/if}

		<div
			class="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 capitalize w-full"
		>
			{title}
		</div>

		{#if $$slots.metadata}
			<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
				<slot name="metadata" />
			</div>
		{/if}
	</div>
</button>
