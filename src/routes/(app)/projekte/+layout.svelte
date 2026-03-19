<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { WEBUI_NAME, showSidebar } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import Spinner from '$lib/components/common/Spinner.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function' ? i18nRaw : { t: (key: string) => key };

	let checkingSession = true;
	let session = null as any;

	let email = '';
	let password = '';
	let submitting = false;
	let errorMessage: string | null = null;

	let authSubscription: { unsubscribe: () => void } | null = null;

	const refreshSession = async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error) console.error('supabase.auth.getSession error', error);
		session = data?.session ?? null;
	};

	const onSubmit = async () => {
		errorMessage = null;
		submitting = true;
		try {
			const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
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
	<title>{i18n.t('Projekte')} • {$WEBUI_NAME}</title>
</svelte:head>

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
					<div class="text-xl font-semibold tracking-tight">{i18n.t('Login')}</div>
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
							<label class="text-xs font-medium text-gray-600 dark:text-gray-300"
								>{i18n.t('Email')}</label
							>
							<input
								class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
								type="email"
								autocomplete="email"
								bind:value={email}
								disabled={submitting}
								required
							/>
						</div>
						<div class="space-y-1.5">
							<label class="text-xs font-medium text-gray-600 dark:text-gray-300"
								>{i18n.t('Password')}</label
							>
							<input
								class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
								type="password"
								autocomplete="current-password"
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
							{#if submitting}<Spinner className="size-4" />{/if}
							<span>{i18n.t('Login')}</span>
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else}
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
