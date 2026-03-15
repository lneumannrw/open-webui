<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import type { DashboardLink } from '$lib/types/dashboard';
	import {
		createDashboardLink,
		updateDashboardLink,
		deleteDashboardLink
	} from '$lib/dashboardLinks';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';
	import Pencil from '$lib/components/icons/Pencil.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
	const dispatch = createEventDispatcher();

	export let show = false;
	export let links: DashboardLink[] = [];

	let loading = false;
	let editItem: DashboardLink | null = null;
	let addingNew = false;
	let form = {
		label: '',
		url: '',
		icon: 'link',
		sort_order: 0
	};

	const ICON_OPTIONS = [
		{ value: 'link', label: 'Link' },
		{ value: 'chart-bar', label: 'Chart' },
		{ value: 'settings', label: 'Settings' },
		{ value: 'document', label: 'Document' },
		{ value: 'folder', label: 'Folder' },
		{ value: 'globe', label: 'Globe' },
		{ value: 'search', label: 'Search' },
		{ value: 'cloud', label: 'Cloud' }
	];

	$: if (show && editItem) {
		form = {
			label: editItem.label ?? '',
			url: editItem.url ?? '',
			icon: editItem.icon?.trim() && ICON_OPTIONS.some((o) => o.value === editItem?.icon) ? editItem.icon : 'link',
			sort_order: editItem.sort_order ?? 0
		};
	}

	$: if (!show) {
		addingNew = false;
		editItem = null;
	}

	function openNew() {
		editItem = null;
		addingNew = true;
		form = {
			label: '',
			url: '',
			icon: 'link',
			sort_order: links.length ? Math.max(...links.map((l) => l.sort_order), 0) + 1 : 0
		};
	}

	function openEdit(link: DashboardLink) {
		editItem = link;
		form = {
			label: link.label ?? '',
			url: link.url ?? '',
			icon: link.icon?.trim() && ICON_OPTIONS.some((o) => o.value === link.icon) ? link.icon : 'link',
			sort_order: link.sort_order ?? 0
		};
	}

	function cancelEdit() {
		editItem = null;
		addingNew = false;
	}

	async function submitHandler() {
		const label = form.label?.trim();
		const url = form.url?.trim();
		if (!label) {
			toast.error(i18n.t('Label ist erforderlich.'));
			return;
		}
		if (!url) {
			toast.error(i18n.t('URL ist erforderlich.'));
			return;
		}
		try {
			new URL(url);
		} catch {
			toast.error(i18n.t('Ungültige URL.'));
			return;
		}

		loading = true;
		try {
			if (editItem) {
				await updateDashboardLink(editItem.id, {
					label,
					url,
					icon: form.icon || null,
					sort_order: form.sort_order
				});
				toast.success(i18n.t('Link wurde aktualisiert.'));
			} else {
				await createDashboardLink({
					label,
					url,
					icon: form.icon || null,
					sort_order: form.sort_order
				});
				toast.success(i18n.t('Link wurde hinzugefügt.'));
			}
			dispatch('save');
			editItem = null;
			addingNew = false;
		} catch (e: any) {
			toast.error(e?.message || i18n.t('Fehler beim Speichern.'));
		} finally {
			loading = false;
		}
	}

	async function handleDelete(link: DashboardLink) {
		if (!confirm(i18n.t('Link wirklich löschen?'))) return;
		try {
			await deleteDashboardLink(link.id);
			toast.success(i18n.t('Link wurde gelöscht.'));
			dispatch('save');
			if (editItem?.id === link.id) {
				editItem = null;
				addingNew = false;
			}
		} catch (e: any) {
			toast.error(e?.message || i18n.t('Fehler beim Löschen.'));
		}
	}
</script>

<Modal size="md" bind:show>
	<div class="modal-content">
		<div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2">
			<div class="text-lg font-medium self-center">{i18n.t('QuickLinks verwalten')}</div>
			<button
				class="self-center"
				aria-label={i18n.t('Close')}
				on:click={() => {
					show = false;
				}}
			>
				<XMark className="size-5" />
			</button>
		</div>

		<div class="flex flex-col w-full px-4 pb-4 dark:text-gray-200">
			<ul class="mb-4 space-y-2 max-h-48 overflow-y-auto">
					{#each links as link (link.id)}
						<li
							class="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2"
						>
							<span class="truncate text-sm">{link.label}</span>
							<div class="flex items-center gap-1 shrink-0">
								<button
									type="button"
									class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									aria-label={i18n.t('Bearbeiten')}
									on:click={() => openEdit(link)}
								>
									<Pencil className="size-4 text-gray-600 dark:text-gray-400" />
								</button>
								<button
									type="button"
									class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
									aria-label={i18n.t('Löschen')}
									on:click={() => handleDelete(link)}
								>
									<GarbageBin className="size-4 text-gray-600 dark:text-gray-400" />
								</button>
							</div>
						</li>
					{/each}
				</ul>

				{#if editItem !== null || addingNew}
					<form class="flex flex-col w-full gap-3" on:submit|preventDefault={submitHandler}>
						<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
							{editItem ? i18n.t('Link bearbeiten') : i18n.t('Neuer Link')}
						</h3>
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="dl-label">{i18n.t('Label')} *</label>
							<input
								id="dl-label"
								class="w-full text-sm bg-transparent outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
								type="text"
								bind:value={form.label}
								placeholder={i18n.t('z.B. Dokumentation')}
								required
							/>
						</div>
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="dl-url">{i18n.t('URL')} *</label>
							<input
								id="dl-url"
								class="w-full text-sm bg-transparent outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
								type="url"
								bind:value={form.url}
								placeholder="https://"
								required
							/>
						</div>
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="dl-icon">{i18n.t('Icon')}</label>
							<select
								id="dl-icon"
								class="w-full text-sm bg-transparent outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
								bind:value={form.icon}
							>
								{#each ICON_OPTIONS as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="dl-sort">{i18n.t('Reihenfolge')}</label>
							<input
								id="dl-sort"
								class="w-full text-sm bg-transparent outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
								type="number"
								min="0"
								bind:value={form.sort_order}
							/>
						</div>
						<div class="flex gap-2 pt-1">
							<button
								class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 {loading
									? 'cursor-not-allowed'
									: ''}"
								type="submit"
								disabled={loading}
							>
								{#if loading}
									<span class="shrink-0">
										<Spinner />
									</span>
								{/if}
								{i18n.t('Speichern')}
							</button>
							{#if editItem}
								<button
									class="px-3.5 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
									type="button"
									on:click={cancelEdit}
								>
									{i18n.t('Abbrechen')}
								</button>
							{/if}
						</div>
					</form>
				{:else}
					<button
						class="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
						type="button"
						on:click={openNew}
					>
						{i18n.t('Neuer Link')}
					</button>
				{/if}
		</div>
	</div>
</Modal>
