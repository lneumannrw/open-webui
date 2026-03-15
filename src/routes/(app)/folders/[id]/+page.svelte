<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import { getFolders, getFolderById } from '$lib/apis/folders';
	import { getChatListByFolderId } from '$lib/apis/chats';
	import { folderExplorerViewMode } from '$lib/stores';
	import FolderBreadcrumbs from '$lib/components/folders/FolderBreadcrumbs.svelte';
	import FolderViewSwitcher from '$lib/components/folders/FolderViewSwitcher.svelte';
	import FolderCard from '$lib/components/folders/FolderCard.svelte';
	import FolderExplorerChatRow from '$lib/components/folders/FolderExplorerChatRow.svelte';
	import FolderOpen from '$lib/components/icons/FolderOpen.svelte';
	import Emoji from '$lib/components/common/Emoji.svelte';
	import Document from '$lib/components/icons/Document.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	type Folder = { id: string; name: string; parent_id: string | null; meta?: { icon?: string } };
	type ChatItem = { id: string; title?: string; created_at?: number };

	let folders: Folder[] = [];
	let currentFolder: Folder | null = null;
	let chats: ChatItem[] = [];
	let loading = true;
	let error: string | null = null;

	$: folderId = $page?.params?.id ?? '';

	$: subFolders = folders
		.filter((f) => f.parent_id === folderId)
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

	function formatTimeAgo(timestamp: number | null | undefined): string {
		if (timestamp == null) return '–';
		const now = Date.now();
		const diff = now - timestamp * 1000;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days}d`;
		if (hours > 0) return `${hours}h`;
		if (minutes > 0) return `${minutes}m`;
		return 'now';
	}

	async function loadFolder() {
		if (!folderId) {
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			const token = localStorage.getItem('token') ?? '';
			const [folderList, folder, chatList] = await Promise.all([
				getFolders(token),
				getFolderById(token, folderId),
				getChatListByFolderId(token, folderId, 1)
			]);
			folders = Array.isArray(folderList) ? folderList : [];
			currentFolder = folder;
			chats = Array.isArray(chatList) ? chatList : [];
		} catch (e) {
			console.error(e);
			error = e?.message ?? 'Failed to load folder';
		} finally {
			loading = false;
		}
	}

	$: if (folderId) {
		loadFolder();
	}
</script>

<div class="flex flex-col w-full min-h-0">
	<div
		class="pt-0.5 pb-1 gap-2 flex flex-col md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-white dark:bg-gray-900"
	>
		<FolderBreadcrumbs folders={folders} currentFolderId={folderId} />
		<div class="flex items-center gap-1.5 shrink-0">
			<FolderViewSwitcher />
		</div>
	</div>

	{#if loading}
		<div class="my-10 flex justify-center">
			<Spinner className="size-8" />
		</div>
	{:else if error}
		<p class="my-6 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
	{:else if currentFolder}
		{#if currentFolder.name}
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white mt-1 mb-2 truncate">
				{currentFolder.name}
			</h2>
		{/if}

		<div class="mt-4 space-y-6">
			<!-- Sub-folders -->
			{#if subFolders.length > 0}
				<div>
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
						{i18n.t('Subfolders')}
					</h3>
					<div
						class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
					>
						{#if $folderExplorerViewMode === 'gallery'}
							<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
								{#each subFolders as folder (folder.id)}
									<FolderCard {folder} />
								{/each}
							</div>
						{:else}
							<div class="px-3 py-2 flex flex-col gap-0.5">
								{#each subFolders as folder (folder.id)}
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
					</div>
				</div>
			{/if}

			<!-- Chats / Items -->
			<div>
				<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
					{i18n.t('Chats')}
				</h3>
				<div
					class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"
				>
					{#if chats.length > 0}
						{#if $folderExplorerViewMode === 'gallery'}
							<div class="my-2 px-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2160px]:grid-cols-4 gap-2">
								{#each chats as chat (chat.id)}
									<a
										href="/c/{chat.id}"
										class="flex flex-col gap-2 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-850/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
									>
										<Document className="size-8 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth="2" />
										<div class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 truncate">
											{chat.title || i18n.t('Untitled chat')}
										</div>
										{#if chat.created_at != null}
											<div class="text-xs text-gray-500 dark:text-gray-400">
												{formatTimeAgo(chat.created_at)}
											</div>
										{/if}
									</a>
								{/each}
							</div>
						{:else}
							<div class="px-3 py-2 flex flex-col gap-0.5">
								{#each chats as chat (chat.id)}
									<FolderExplorerChatRow {chat} />
								{/each}
							</div>
						{/if}
					{:else}
						<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('No chats in this folder.')}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<p class="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
			{i18n.t('Folder not found.')}
		</p>
	{/if}
</div>
