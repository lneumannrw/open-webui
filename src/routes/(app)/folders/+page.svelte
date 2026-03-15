<script lang="ts">
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import { getFolders } from '$lib/apis/folders';
	import { folderExplorerViewMode } from '$lib/stores';
	import FolderBreadcrumbs from '$lib/components/folders/FolderBreadcrumbs.svelte';
	import FolderViewSwitcher from '$lib/components/folders/FolderViewSwitcher.svelte';
	import FolderCard from '$lib/components/folders/FolderCard.svelte';
	import FolderOpen from '$lib/components/icons/FolderOpen.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Emoji from '$lib/components/common/Emoji.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	type Folder = { id: string; name: string; parent_id: string | null; meta?: { icon?: string } };

	let folders: Folder[] = [];
	let loading = true;
	let error: string | null = null;
	let searchQuery = '';

	$: rootFolders = folders
		.filter((f) => f.parent_id === null)
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

	$: filteredRootFolders = searchQuery.trim()
		? rootFolders.filter((f) =>
				f.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
			)
		: rootFolders;

	onMount(async () => {
		try {
			const token = localStorage.getItem('token') ?? '';
			const list = await getFolders(token);
			folders = Array.isArray(list) ? list : [];
		} catch (e) {
			console.error(e);
			error = e?.message ?? 'Failed to load folders';
		} finally {
			loading = false;
		}
	});
</script>

<div class="flex flex-col w-full min-h-0">
	<div
		class="pt-0.5 pb-1 gap-2 flex flex-col md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-white dark:bg-gray-900"
	>
		<FolderBreadcrumbs folders={folders} currentFolderId={null} />
		<div class="flex items-center gap-1.5 shrink-0">
			<FolderViewSwitcher />
		</div>
	</div>

	<!-- Search: find folders by name (e.g. old archives) -->
	<div class="mt-2 mb-3 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850/50 px-3 py-2">
		<Search className="size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth="2" />
		<input
			type="text"
			bind:value={searchQuery}
			class="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
			placeholder={i18n.t('Search folders…')}
			aria-label={i18n.t('Search folders')}
		/>
	</div>

	{#if loading}
		<div class="my-10 flex justify-center">
			<Spinner className="size-8" />
		</div>
	{:else if error}
		<p class="my-6 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
	{:else}
		<div class="mt-4 space-y-4">
			<div
				class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
			>
				{#if $folderExplorerViewMode === 'gallery'}
					<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
						{#each filteredRootFolders as folder (folder.id)}
							<FolderCard {folder} />
						{/each}
					</div>
				{:else}
					<div class="px-3 py-2 flex flex-col gap-0.5">
						{#each filteredRootFolders as folder (folder.id)}
							<a
								href="/folders/{folder.id}"
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850/50 transition"
							>
								{#if folder.meta?.icon}
									<Emoji className="size-5 shrink-0" shortCode={folder.meta.icon} />
								{:else}
									<FolderOpen className="size-5 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth="2" />
								{/if}
								<span class="flex-1 font-medium text-gray-900 dark:text-white truncate">{folder.name || i18n.t('Folder')}</span>
							</a>
						{/each}
					</div>
				{/if}
				{#if rootFolders.length === 0}
					<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
						{i18n.t('No folders yet. Create folders in the sidebar.')}
					</p>
				{:else if filteredRootFolders.length === 0}
					<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
						{i18n.t('No folders match your search.')}
					</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
