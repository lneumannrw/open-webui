<script lang="ts">
	import { getContext } from 'svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';
	import DropdownOptions from '$lib/components/common/DropdownOptions.svelte';

	export let searchValue = '';
	export let searchPlaceholder = 'Suchen…';
	export let filters: { key: string; label: string; options: { value: string; label: string }[] }[] =
		[];
	export let filterValues: Record<string, string> = {};

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

	function clearSearch() {
		searchValue = '';
	}

	function getFilterItemsWithAll(options: { value: string; label: string }[]) {
		return [{ value: '', label: i18n.t('Alle') }, ...options];
	}
</script>

<div
	class="flex flex-wrap items-center gap-2 py-2 px-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100/30 dark:border-gray-850/30"
>
	<div class="flex flex-1 min-w-[200px] items-center rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50">
		<div class="self-center pl-3 pr-2 text-gray-400 dark:text-gray-500">
			<Search className="size-3.5" />
		</div>
		<input
			type="text"
			class="flex-1 w-full text-sm py-1.5 pr-2 rounded-r-xl outline-hidden bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
			bind:value={searchValue}
			placeholder={searchPlaceholder}
			aria-label={searchPlaceholder}
		/>
		{#if searchValue.trim()}
			<button
				type="button"
				class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
				on:click={clearSearch}
				aria-label={i18n.t('Suche löschen')}
			>
				<XMark className="size-3.5" strokeWidth="2" />
			</button>
		{/if}
	</div>
	{#if filters.length > 0}
		<div class="flex flex-wrap items-center gap-2">
			{#each filters as filter}
				<div class="flex items-center gap-1.5">
					<span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{filter.label}:</span>
					<DropdownOptions
						align="start"
						className="flex items-center gap-2 min-w-[120px] px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 placeholder-gray-400 outline-hidden focus:outline-hidden"
						placeholder={i18n.t('Alle')}
						items={getFilterItemsWithAll(filter.options)}
						value={filterValues[filter.key] ?? ''}
						onChange={(value) => {
							filterValues = { ...filterValues, [filter.key]: value ?? '' };
						}}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
