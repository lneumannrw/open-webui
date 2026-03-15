<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { DashboardLink } from '$lib/types/dashboard';
	import Link from '$lib/components/icons/Link.svelte';
	import ChartBar from '$lib/components/icons/ChartBar.svelte';
	import Settings from '$lib/components/icons/Settings.svelte';
	import Document from '$lib/components/icons/Document.svelte';
	import Folder from '$lib/components/icons/Folder.svelte';
	import GlobeAltSolid from '$lib/components/icons/GlobeAltSolid.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Cloud from '$lib/components/icons/Cloud.svelte';
	import PlusAlt from '$lib/components/icons/PlusAlt.svelte';

	/** Map icon name (from DB) to Svelte icon component. Fallback: Link. */
	const ICON_MAP: Record<string, ComponentType> = {
		link: Link,
		'chart-bar': ChartBar,
		chartbar: ChartBar,
		settings: Settings,
		document: Document,
		folder: Folder,
		globe: GlobeAltSolid,
		search: Search,
		cloud: Cloud
	};

	function getIconComponent(iconName: string | null): ComponentType {
		if (!iconName?.trim()) return Link;
		const key = iconName.trim().toLowerCase().replace(/\s+/g, '-');
		return ICON_MAP[key] ?? Link;
	}

	export let links: DashboardLink[] = [];
	export let editable = false;
	export let onAddClick: (() => void) | null = null;
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each links as link (link.id)}
		<a
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition min-w-0"
		>
			<svelte:component this={getIconComponent(link.icon)} className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
			<span class="truncate">{link.label}</span>
		</a>
	{/each}
	{#if editable && onAddClick}
		<button
			type="button"
			class="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-900/50 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
			aria-label="Add link"
			on:click={onAddClick}
		>
			<PlusAlt className="size-5" />
		</button>
	{/if}
</div>
