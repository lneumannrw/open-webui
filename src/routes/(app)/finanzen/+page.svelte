<script lang="ts">
	import { getContext } from 'svelte';
	import Banknotes from '$lib/components/icons/Banknotes.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
</script>

<div class="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-gray-400 dark:text-gray-600">
	<Banknotes className="size-12 opacity-30" />
	<div class="text-center">
		<p class="text-base font-medium text-gray-500 dark:text-gray-400">{i18n.t('Finanzen')}</p>
		<p class="text-sm mt-1">{i18n.t('Dieser Bereich wird in Kürze verfügbar sein.')}</p>
	</div>
</div>
