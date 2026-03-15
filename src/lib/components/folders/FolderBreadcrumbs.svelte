<script lang="ts">
	import { getContext } from 'svelte';

	export let folders: Array<{ id: string; name: string; parent_id: string | null }> = [];
	/** Current folder id, or null for root (/folders) */
	export let currentFolderId: string | null = null;

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	/** Build path from root to current folder (inclusive) for breadcrumb display */
	$: folderMap = new Map(folders.map((f) => [f.id, f]));
	$: path = (() => {
		if (!currentFolderId) return [];
		const list: Array<{ id: string; name: string }> = [];
		let id: string | null = currentFolderId;
		while (id) {
			const folder = folderMap.get(id);
			if (!folder) break;
			list.unshift({ id: folder.id, name: folder.name });
			id = folder.parent_id;
		}
		return list;
	})();
</script>

<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 min-w-0">
	<a
		href="/folders"
		class="shrink-0 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:underline truncate"
	>
		{i18n.t('Folders')}
	</a>
	{#each path as segment, i}
		<span class="shrink-0" aria-hidden="true">/</span>
		{#if i < path.length - 1}
			<a
				href="/folders/{segment.id}"
				class="shrink-0 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:underline truncate max-w-[8rem] sm:max-w-[12rem]"
				title={segment.name}
			>
				{segment.name}
			</a>
		{:else}
			<span class="truncate max-w-[10rem] sm:max-w-none font-medium text-gray-900 dark:text-gray-100" title={segment.name}>
				{segment.name}
			</span>
		{/if}
	{/each}
</nav>
