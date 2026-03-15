<script lang="ts">
	import { getContext } from 'svelte';

	const i18nRaw = getContext('i18n');
	const i18n = i18nRaw && typeof (i18nRaw as any)?.t === 'function' ? i18nRaw : { t: (key: string) => key };
</script>

<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{i18n.t('Anfragen')}</h1>
<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
	{i18n.t('Inhalt folgt.')}
</p>
