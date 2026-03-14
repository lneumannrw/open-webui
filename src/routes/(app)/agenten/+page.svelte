<script>
	import { getContext } from 'svelte';
	import { showSidebar, user } from '$lib/stores';
	import UserMenu from '$lib/components/layout/Sidebar/UserMenu.svelte';
	import Sparkles from '$lib/components/icons/Sparkles.svelte';
	import { WEBUI_API_BASE_URL } from '$lib/constants';

	const i18n = getContext('i18n');
</script>

<div
	class=" flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar
		? 'md:max-w-[calc(100%-var(--sidebar-width))]'
		: ''} max-w-full"
>
	<nav class="   px-2 pt-1.5 backdrop-blur-xl w-full drag-region">
		<div class=" flex items-center">
			<div class="ml-2 py-0.5 self-center flex items-center justify-between w-full">
				<div class="flex items-center gap-2">
					<Sparkles className="size-5 text-gray-600 dark:text-gray-400" />
					<span class="text-sm font-medium">{$i18n.t('Agenten')}</span>
				</div>
				{#if $user !== undefined && $user !== null}
					<UserMenu
						className="max-w-[240px]"
						role={$user?.role}
						help={true}
						on:show={() => {}}
					>
						<button
							class="select-none flex rounded-xl p-1.5 w-full hover:bg-gray-50 dark:hover:bg-gray-850 transition"
							aria-label="User Menu"
						>
							<img
								src={`${WEBUI_API_BASE_URL}/users/${$user?.id}/profile/image`}
								class="size-6 object-cover rounded-full"
								alt="User profile"
								draggable="false"
							/>
						</button>
					</UserMenu>
				{/if}
			</div>
		</div>
	</nav>

	<div class=" flex-1 max-h-full overflow-y-auto p-4">
		<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{$i18n.t('Agenten')}</h1>
		<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
			{$i18n.t('Agenten')} – Platzhalter. Inhalt folgt.
		</p>
	</div>
</div>
