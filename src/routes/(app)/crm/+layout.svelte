<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { WEBUI_NAME, mobile, showSidebar } from '$lib/stores';
	import { page } from '$app/stores';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Sidebar from '$lib/components/icons/Sidebar.svelte';
	import UsersSolid from '$lib/components/icons/UsersSolid.svelte';
	import QueueList from '$lib/components/icons/QueueList.svelte';
	import User from '$lib/components/icons/User.svelte';
	import Folder from '$lib/components/icons/Folder.svelte';
	import Document from '$lib/components/icons/Document.svelte';
	import ChartBar from '$lib/components/icons/ChartBar.svelte';

	const i18nRaw = getContext('i18n');
	const i18n = i18nRaw && typeof (i18nRaw as any)?.t === 'function' ? i18nRaw : { t: (key: string) => key };

	let loaded = true;

	onMount(() => {});
</script>

<svelte:head>
	<title>
		{i18n.t('CRM')} • {$WEBUI_NAME}
	</title>
</svelte:head>

{#if loaded}
	<div
		class="relative flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar
			? 'md:max-w-[calc(100%-var(--sidebar-width))]'
			: ''} max-w-full"
	>
		<nav class="px-2.5 pt-1.5 backdrop-blur-xl drag-region select-none">
			<div class="flex items-center gap-1">
				{#if $mobile}
					<div class="{$showSidebar ? 'md:hidden' : ''} self-center flex flex-none items-center">
						<Tooltip
							content={$showSidebar ? i18n.t('Close Sidebar') : i18n.t('Open Sidebar')}
							interactive={true}
						>
							<button
								id="sidebar-toggle-button"
								class="cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
								aria-label={$showSidebar ? i18n.t('Close Sidebar') : i18n.t('Open Sidebar')}
								on:click={() => {
									showSidebar.set(!$showSidebar);
								}}
							>
								<div class="self-center p-1.5">
									<Sidebar />
								</div>
							</button>
						</Tooltip>
					</div>
				{/if}

				<div class="flex w-full">
					<div
						class="flex gap-1 scrollbar-none overflow-x-auto w-fit text-center text-sm font-medium rounded-full bg-transparent py-1"
					>
						<a
							draggable="false"
							aria-current={$page.url.pathname.includes('/crm/dashboard') ? 'page' : null}
							class="min-w-fit p-1.5 flex items-center gap-1.5 {$page.url.pathname.includes('/crm/dashboard')
								? ''
								: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
							href="/crm/dashboard"
						>
							<ChartBar className="size-4 shrink-0" />
							{i18n.t('Dashboard')}
						</a>
						<a
							draggable="false"
							aria-current={$page.url.pathname.includes('/crm/kunden') ? 'page' : null}
							class="min-w-fit p-1.5 flex items-center gap-1.5 {$page.url.pathname.includes('/crm/kunden')
								? ''
								: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
							href="/crm/kunden"
						>
							<UsersSolid className="size-4 shrink-0" />
							{i18n.t('Kunden')}
						</a>
						<a
							draggable="false"
							aria-current={$page.url.pathname.includes('/crm/anfragen') ? 'page' : null}
							class="min-w-fit p-1.5 flex items-center gap-1.5 {$page.url.pathname.includes('/crm/anfragen')
								? ''
								: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
							href="/crm/anfragen"
						>
							<QueueList className="size-4 shrink-0" />
							{i18n.t('Anfragen')}
						</a>
						<a
							draggable="false"
							aria-current={$page.url.pathname.includes('/crm/ansprechpartner') ? 'page' : null}
							class="min-w-fit p-1.5 flex items-center gap-1.5 {$page.url.pathname.includes('/crm/ansprechpartner')
								? ''
								: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
							href="/crm/ansprechpartner"
						>
							<User className="size-4 shrink-0" />
							{i18n.t('Ansprechpartner')}
						</a>
						<a
							draggable="false"
							aria-current={$page.url.pathname.includes('/crm/projekte') ? 'page' : null}
							class="min-w-fit p-1.5 flex items-center gap-1.5 {$page.url.pathname.includes('/crm/projekte')
								? ''
								: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
							href="/crm/projekte"
						>
							<Folder className="size-4 shrink-0" />
							{i18n.t('Projekte')}
						</a>
						<a
							draggable="false"
							aria-current={$page.url.pathname.includes('/crm/vertraege') ? 'page' : null}
							class="min-w-fit p-1.5 flex items-center gap-1.5 {$page.url.pathname.includes('/crm/vertraege')
								? ''
								: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
							href="/crm/vertraege"
						>
							<Document className="size-4 shrink-0" />
							{i18n.t('Verträge')}
						</a>
					</div>
				</div>
			</div>
		</nav>

		<div class="pb-1 px-3 md:px-[18px] flex-1 max-h-full overflow-y-auto">
			<slot />
		</div>
	</div>
{/if}
