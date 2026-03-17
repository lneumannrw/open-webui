<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { WEBUI_NAME, mobile, showSidebar } from '$lib/stores';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
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

	let checkingSession = true;
	let session = null as any;

	let email = '';
	let password = '';
	let submitting = false;
	let errorMessage: string | null = null;

	let authSubscription: { unsubscribe: () => void } | null = null;

	const refreshSession = async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error) {
			console.error('supabase.auth.getSession error', error);
		}
		session = data?.session ?? null;
	};

	const onSubmit = async () => {
		errorMessage = null;
		submitting = true;
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password
			});
			if (error) {
				errorMessage = error.message || i18n.t('Login failed');
				return;
			}
			await refreshSession();
		} finally {
			submitting = false;
		}
	};

	onMount(async () => {
		checkingSession = true;
		await refreshSession();

		const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
			session = newSession ?? null;
			errorMessage = null;
		});

		authSubscription = (data as any)?.subscription ?? null;
		checkingSession = false;
	});

	onDestroy(() => {
		authSubscription?.unsubscribe?.();
	});
</script>

<svelte:head>
	<title>
		{i18n.t('CRM')} • {$WEBUI_NAME}
	</title>
</svelte:head>

{#if loaded}
	{#if checkingSession}
		<div class="w-full h-screen max-h-[100dvh] flex items-center justify-center">
			<Spinner className="size-5" />
		</div>
	{:else if !session}
		<div
			class="w-full h-screen max-h-[100dvh] flex items-center justify-center bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100"
		>
			<div class="w-full max-w-md px-6">
				<div
					class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm"
				>
					<div class="px-6 pt-6 pb-5">
						<div class="text-xl font-semibold tracking-tight">{i18n.t('CRM Login')}</div>
						<div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{i18n.t('Please sign in to continue')}
						</div>

						<form
							class="mt-6 space-y-4"
							on:submit|preventDefault={async () => {
								await onSubmit();
							}}
						>
							<div class="space-y-1.5">
								<label class="text-xs font-medium text-gray-600 dark:text-gray-300">
									{i18n.t('Email')}
								</label>
								<input
									class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
									type="email"
									autocomplete="email"
									inputmode="email"
									placeholder="you@company.com"
									bind:value={email}
									disabled={submitting}
									required
								/>
							</div>

							<div class="space-y-1.5">
								<label class="text-xs font-medium text-gray-600 dark:text-gray-300">
									{i18n.t('Password')}
								</label>
								<input
									class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
									type="password"
									autocomplete="current-password"
									placeholder="••••••••"
									bind:value={password}
									disabled={submitting}
									required
								/>
							</div>

							{#if errorMessage}
								<div
									class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2"
								>
									{errorMessage}
								</div>
							{/if}

							<button
								type="submit"
								class="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-60 transition font-medium text-sm"
								disabled={submitting || !email.trim() || !password}
							>
								{#if submitting}
									<Spinner className="size-4" />
								{/if}
								<span>{i18n.t('Login')}</span>
							</button>
						</form>
					</div>
				</div>

				<div class="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
					{i18n.t('Authenticated access required')}
				</div>
			</div>
		</div>
	{:else}
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
{/if}
