<script>
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	const i18n = getContext('i18n');

	import { user } from '$lib/stores';
	import { createNewKnowledge } from '$lib/apis/knowledge';

	import AccessControl from '../common/AccessControl.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import KnowledgeIconPicker from './KnowledgeIconPicker.svelte';
	import {
		getKnowledgeIconComponent,
		KNOWLEDGE_TAG_COLORS,
		TAG_COLOR_SWATCH_CLASS
	} from './knowledgeIcons';
	import FolderOpen from '$lib/components/icons/FolderOpen.svelte';

	let loading = false;

	let name = '';
	let description = '';
	let accessGrants = [];
	let customTag = '';
	let icon = '';
	let tagColor = '';

	const submitHandler = async () => {
		loading = true;

		if (name.trim() === '' || description.trim() === '') {
			toast.error($i18n.t('Please fill in all fields.'));
			name = '';
			description = '';
			loading = false;
			return;
		}

		const meta =
			customTag.trim() || icon || tagColor
				? {
						...(customTag.trim() && { custom_tag: customTag.trim() }),
						...(icon && { icon }),
						...(tagColor && { tag_color: tagColor })
					}
				: undefined;

		const res = await createNewKnowledge(
			localStorage.token,
			name,
			description,
			accessGrants,
			meta
		).catch((e) => {
			toast.error(`${e}`);
		});

		if (res) {
			toast.success($i18n.t('Knowledge created successfully.'));
			goto(`/knowledge/${res.id}`);
		}

		loading = false;
	};

	$: CurrentIconComponent = getKnowledgeIconComponent(icon) ?? FolderOpen;
</script>

<div class="w-full max-h-full">
	<button
		class="flex space-x-1"
		on:click={() => {
			goto('/knowledge');
		}}
	>
		<div class=" self-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-4 h-4"
			>
				<path
					fill-rule="evenodd"
					d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<div class=" self-center font-medium text-sm">{$i18n.t('Back')}</div>
	</button>

	<form
		class="flex flex-col max-w-lg mx-auto mt-10 mb-10"
		on:submit|preventDefault={() => {
			submitHandler();
		}}
	>
		<div class=" w-full flex flex-col justify-center">
			<div class=" text-2xl font-medium font-primary mb-2.5">
				{$i18n.t('Create a knowledge base')}
			</div>

			<div class="w-full flex flex-col gap-2.5">
				<div class="w-full">
					<div class=" text-sm mb-2">{$i18n.t('What are you working on?')}</div>

					<div class="w-full mt-1">
						<input
							class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"
							type="text"
							bind:value={name}
							placeholder={$i18n.t('Name your knowledge base')}
							required
						/>
					</div>
				</div>

				<div>
					<div class="text-sm mb-2">{$i18n.t('What are you trying to achieve?')}</div>

					<div class=" w-full mt-1">
						<textarea
							class="w-full resize-none rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"
							rows="4"
							bind:value={description}
							placeholder={$i18n.t('Describe your knowledge base and objectives')}
							required
						/>
					</div>
				</div>

				<div class="w-full">
					<div class="text-sm mb-2">{$i18n.t('Tag')}</div>
					<div class="w-full mt-1">
						<input
							class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"
							type="text"
							bind:value={customTag}
							placeholder={$i18n.t('Collection')}
						/>
					</div>
					<div class="flex items-center gap-2 mt-2">
						<span class="text-xs text-gray-500 dark:text-gray-400">{$i18n.t('Tag color')}</span>
						<div class="flex gap-1.5">
							{#each KNOWLEDGE_TAG_COLORS as colorId}
								<button
									type="button"
									class="size-6 rounded-full {TAG_COLOR_SWATCH_CLASS[colorId]} transition {tagColor === colorId
										? 'ring-2 ring-offset-2 ring-gray-600 dark:ring-gray-400'
										: 'hover:opacity-80'}"
									aria-label={colorId}
									title={colorId}
									on:click={() => {
										tagColor = tagColor === colorId ? '' : colorId;
									}}
								/>
							{/each}
						</div>
					</div>
				</div>

				<div class="w-full">
					<div class="text-sm mb-2">{$i18n.t('Icon')}</div>
					<div class="mt-1">
						<KnowledgeIconPicker
							selectedId={icon || undefined}
							onSelect={(id) => {
								icon = id;
							}}
						>
							<button
								type="button"
								class="flex items-center gap-2 rounded-lg py-2 px-4 text-sm bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
							>
								<CurrentIconComponent className="size-5" />
								<span class="text-gray-600 dark:text-gray-400">
									{icon ? $i18n.t('Change icon') : $i18n.t('Choose icon')}
								</span>
							</button>
						</KnowledgeIconPicker>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-2">
			<AccessControl
				bind:accessGrants
				accessRoles={['read', 'write']}
				share={$user?.permissions?.sharing?.knowledge || $user?.role === 'admin'}
				sharePublic={$user?.permissions?.sharing?.public_knowledge || $user?.role === 'admin'}
				shareUsers={($user?.permissions?.access_grants?.allow_users ?? true) ||
					$user?.role === 'admin'}
			/>
		</div>

		<div class="flex justify-end mt-2">
			<div>
				<button
					class=" text-sm px-4 py-2 transition rounded-lg {loading
						? ' cursor-not-allowed bg-gray-100 dark:bg-gray-800'
						: ' bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800'} flex"
					type="submit"
					disabled={loading}
				>
					<div class=" self-center font-medium">{$i18n.t('Create Knowledge')}</div>

					{#if loading}
						<div class="ml-1.5 self-center">
							<Spinner />
						</div>
					{/if}
				</button>
			</div>
		</div>
	</form>
</div>
