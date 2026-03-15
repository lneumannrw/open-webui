<script lang="ts">
	import FolderOpen from '$lib/components/icons/FolderOpen.svelte';
	import Emoji from '$lib/components/common/Emoji.svelte';

	export let folder: { id: string; name: string; meta?: { icon?: string } } = {
		id: '',
		name: '',
		meta: {}
	};
</script>

<a
	href="/folders/{folder.id}"
	class="relative flex flex-col items-start gap-3 w-full p-4 text-left rounded-2xl transition dark:hover:bg-gray-850/50 hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
>
	<div class="flex shrink-0 text-gray-600 dark:text-gray-400" aria-hidden="true">
		{#if folder.meta?.icon}
			<Emoji className="size-10" shortCode={folder.meta.icon} />
		{:else}
			<FolderOpen className="size-10" strokeWidth="1.5" />
		{/if}
	</div>
	<div class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 w-full">
		{folder.name || 'Folder'}
	</div>
</a>
