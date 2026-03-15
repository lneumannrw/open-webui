<script lang="ts">
	export let type = 'info';
	export let content = '';
	export let tagColor: string | undefined = undefined;

	const classNames: Record<string, string> = {
		info: 'bg-blue-500/20 text-blue-700 dark:text-blue-200 ',
		success: 'bg-green-500/20 text-green-700 dark:text-green-200',
		warning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-200',
		error: 'bg-red-500/20 text-red-700 dark:text-red-200',
		muted: 'bg-gray-500/20 text-gray-700 dark:text-gray-200'
	};

	const tagColorToClass: Record<string, string> = {
		gray: 'bg-gray-500/20 text-gray-700 dark:text-gray-200',
		red: 'bg-red-500/20 text-red-700 dark:text-red-200',
		yellow: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-200',
		green: 'bg-green-500/20 text-green-700 dark:text-green-200',
		blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-200',
		purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-200'
	};

	$: resolvedClass =
		tagColor && tagColorToClass[tagColor]
			? tagColorToClass[tagColor]
			: classNames[type] ?? classNames['info'];
</script>

<div
	class=" text-xs font-medium {resolvedClass} w-fit px-[5px] rounded-lg uppercase line-clamp-1 mr-0.5"
>
	{content}
</div>
