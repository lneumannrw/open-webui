<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { user, WEBUI_NAME, showSidebar } from '$lib/stores';
	import { goto } from '$app/navigation';

	const i18n = getContext('i18n');

	let loaded = false;

	onMount(() => {
		if ($user?.role !== 'admin' && !$user?.permissions?.workspace?.knowledge) {
			goto('/');
			return;
		}
		loaded = true;
	});
</script>

<svelte:head>
	<title>
		{$i18n.t('Knowledge')} • {$WEBUI_NAME}
	</title>
</svelte:head>

{#if loaded}
	<div
		class="relative flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar
			? 'md:max-w-[calc(100%-var(--sidebar-width))]'
			: ''} max-w-full"
	>
		<div class="pb-1 px-3 md:px-[18px] flex-1 max-h-full overflow-y-auto">
			<slot />
		</div>
	</div>
{/if}
