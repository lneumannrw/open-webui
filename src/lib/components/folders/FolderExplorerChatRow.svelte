<script lang="ts">
	import { getContext } from 'svelte';
	import Document from '$lib/components/icons/Document.svelte';

	export let chat: { id: string; title?: string; created_at?: number } = {
		id: '',
		title: '',
		created_at: null
	};

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };

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
</script>

<a
	href="/c/{chat.id}"
	class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850/50 transition text-left"
>
	<Document className="size-5 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth="2" />
	<div class="min-w-0 flex-1">
		<div class="text-sm font-medium text-gray-900 dark:text-white truncate">
			{chat.title || i18n.t('Untitled chat')}
		</div>
		{#if chat.created_at != null}
			<div class="text-xs text-gray-500 dark:text-gray-400">
				{formatTimeAgo(chat.created_at)}
			</div>
		{/if}
	</div>
</a>
