<script lang="ts">
	import { getContext } from 'svelte';
	import { folderExplorerViewMode, setFolderExplorerViewMode } from '$lib/stores';
	import Squares2x2 from '$lib/components/icons/Squares2x2.svelte';
	import ListBullet from '$lib/components/icons/ListBullet.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
</script>

<div class="flex items-center gap-0.5 rounded-xl bg-gray-50 dark:bg-gray-850 p-0.5">
	<Tooltip content={i18n.t('Gallery view')}>
		<button
			class="p-1.5 rounded-lg transition {$folderExplorerViewMode === 'gallery'
				? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
				: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
			aria-label={i18n.t('Gallery view')}
			aria-pressed={$folderExplorerViewMode === 'gallery'}
			on:click={() => setFolderExplorerViewMode('gallery')}
		>
			<Squares2x2 className="size-4" strokeWidth="2" />
		</button>
	</Tooltip>
	<Tooltip content={i18n.t('List view')}>
		<button
			class="p-1.5 rounded-lg transition {$folderExplorerViewMode === 'list'
				? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
				: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
			aria-label={i18n.t('List view')}
			aria-pressed={$folderExplorerViewMode === 'list'}
			on:click={() => setFolderExplorerViewMode('list')}
		>
			<ListBullet className="size-4" strokeWidth="2" />
		</button>
	</Tooltip>
</div>
