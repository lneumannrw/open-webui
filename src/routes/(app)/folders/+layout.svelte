<script lang="ts">
	import { getContext } from 'svelte';
	import { showSidebar, WEBUI_NAME } from '$lib/stores';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
</script>

<svelte:head>
	<title>
		{i18n.t('Folders')} • {$WEBUI_NAME}
	</title>
</svelte:head>

<div
	class="relative flex flex-col w-full h-screen max-h-[100dvh] transition-[max-width] duration-200 ease-in-out {$showSidebar
		? 'md:max-w-[calc(100%-var(--sidebar-width))]'
		: ''} max-w-full flex-1 min-w-0"
>
	<div class="pb-1 px-3 md:px-[18px] flex-1 min-h-0 overflow-y-auto">
		<slot />
	</div>
</div>
