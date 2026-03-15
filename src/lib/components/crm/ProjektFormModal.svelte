<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Kunde } from '$lib/types/kunden';
	import type { ProjektWithBausteineCount } from '$lib/types/projekte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
	const dispatch = createEventDispatcher();

	export let show = false;
	export let editItem: ProjektWithBausteineCount | null = null;
	export let kunden: Kunde[] = [];

	let loading = false;
	let form = {
		name: '',
		beschreibung: '',
		kunden_id: ''
	};
	let bausteine: { name: string; beschreibung: string }[] = [];

	$: if (show) {
		if (editItem) {
			form = {
				name: editItem.name ?? '',
				beschreibung: editItem.beschreibung ?? '',
				kunden_id: editItem.kunden_id ?? ''
			};
			bausteine = [];
		} else {
			form = { name: '', beschreibung: '', kunden_id: '' };
			bausteine = [];
		}
	}

	function addBaustein() {
		bausteine = [...bausteine, { name: '', beschreibung: '' }];
	}

	function removeBaustein(index: number) {
		bausteine = bausteine.filter((_, i) => i !== index);
	}

	async function submitHandler() {
		if (!form.name?.trim()) {
			toast.error(i18n.t('Projektname ist erforderlich.'));
			return;
		}

		loading = true;

		const projektPayload = {
			name: form.name.trim(),
			beschreibung: form.beschreibung.trim() || null,
			kunden_id: form.kunden_id?.trim() || null
		};

		if (editItem) {
			const { error: updateError } = await supabase
				.from('projekte')
				.update(projektPayload)
				.eq('id', editItem.id);
			loading = false;
			if (updateError) {
				toast.error(updateError.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Projekt wurde aktualisiert.'));
			dispatch('save');
			show = false;
			return;
		}

		const { data: insertedProjekt, error: projektError } = await supabase
			.from('projekte')
			.insert(projektPayload)
			.select('id')
			.single();

		if (projektError) {
			loading = false;
			toast.error(projektError.message || i18n.t('Fehler beim Anlegen des Projekts.'));
			return;
		}

		const projektId = insertedProjekt?.id;
		if (!projektId) {
			loading = false;
			toast.error(i18n.t('Projekt konnte nicht gespeichert werden.'));
			return;
		}

		const bausteineToSave = bausteine.filter((b) => b.name?.trim());
		if (bausteineToSave.length > 0) {
			const bausteinRows = bausteineToSave.map((b) => ({
				projekt_id: projektId,
				name: b.name.trim(),
				beschreibung: b.beschreibung?.trim() || null
			}));
			const { error: bausteinError } = await supabase.from('projekt_bausteine').insert(bausteinRows);
			if (bausteinError) {
				loading = false;
				toast.error(
					i18n.t('Projekt wurde angelegt, aber Bausteine konnten nicht gespeichert werden:') +
						' ' +
						bausteinError.message
				);
				return;
			}
		}

		loading = false;
		toast.success(i18n.t('Projekt wurde angelegt.'));
		dispatch('save');
		show = false;
	}
</script>

<Modal size="lg" bind:show>
	<div class="modal-content">
		<div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2">
			<div class="text-lg font-medium self-center">{editItem ? i18n.t('Projekt bearbeiten') : i18n.t('Neues Projekt')}</div>
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
			<form
				class="flex flex-col w-full"
				on:submit|preventDefault={submitHandler}
			>
				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="projekt-name">
						{i18n.t('Projektname')} *
					</label>
					<input
						id="projekt-name"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.name}
						placeholder={i18n.t('z.B. Website-Relaunch')}
						required
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="projekt-kunde">
						{i18n.t('Kunde')}
					</label>
					<select
						id="projekt-kunde"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						bind:value={form.kunden_id}
					>
						<option value="">{i18n.t('Kein Kunde')}</option>
						{#each kunden as k}
							<option value={k.id}>{k.kundennummer} – {k.unternehmensname}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="projekt-beschreibung">
						{i18n.t('Beschreibung')}
					</label>
					<textarea
						id="projekt-beschreibung"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 min-h-[80px]"
						bind:value={form.beschreibung}
						placeholder={i18n.t('Projektbeschreibung …')}
					></textarea>
				</div>

				<div class="flex flex-col w-full mb-3">
					<div class="flex items-center justify-between mb-2">
						<span class="text-xs text-gray-500">{i18n.t('Bausteine')}</span>
						<button
							type="button"
							class="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
							on:click={addBaustein}
						>
							<Plus className="size-3.5" />
							{i18n.t('Baustein hinzufügen')}
						</button>
					</div>
					{#each bausteine as baustein, i}
						<div
							class="flex gap-2 items-start mb-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
						>
							<div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
								<input
									class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5"
									type="text"
									bind:value={baustein.name}
									placeholder={i18n.t('Name')}
								/>
								<input
									class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5"
									type="text"
									bind:value={baustein.beschreibung}
									placeholder={i18n.t('Beschreibung')}
								/>
							</div>
							<button
								type="button"
								class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 dark:hover:text-red-400 shrink-0"
								aria-label={i18n.t('Entfernen')}
								on:click={() => removeBaustein(i)}
							>
								<GarbageBin className="size-4" />
							</button>
						</div>
					{/each}
				</div>

				<div class="flex justify-end pt-3 text-sm font-medium">
					<button
						class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap {loading
							? 'cursor-not-allowed'
							: ''}"
						type="submit"
						disabled={loading}
					>
						{i18n.t('Speichern')}
						{#if loading}
							<span class="shrink-0">
								<Spinner />
							</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</Modal>
