<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Kunde } from '$lib/types/kunden';
	import type { AnfrageStatus, AnfrageWithKunde } from '$lib/types/anfragen';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
	const dispatch = createEventDispatcher();

	export let show = false;
	export let editItem: AnfrageWithKunde | null = null;
	export let kunden: Kunde[] = [];
	/** When opening for "new", pre-fill kunden_id (e.g. from customer detail page). */
	export let defaultKundenId = '';

	let loading = false;
	let form = {
		kunden_id: '',
		titel: '',
		beschreibung: '',
		status: 'Neu' as AnfrageStatus,
		budget: ''
	};

	const statusOptions: AnfrageStatus[] = [
		'Neu',
		'In Bearbeitung',
		'Gewonnen',
		'Verloren',
		'Abgebrochen'
	];

	$: if (show) {
		if (editItem) {
			form = {
				kunden_id: editItem.kunden_id ?? '',
				titel: editItem.titel ?? '',
				beschreibung: editItem.beschreibung ?? '',
				status: editItem.status ?? 'Neu',
				budget: editItem.budget != null ? String(editItem.budget) : ''
			};
		} else {
			form = {
				kunden_id: defaultKundenId || '',
				titel: '',
				beschreibung: '',
				status: 'Neu',
				budget: ''
			};
		}
	}

	async function submitHandler() {
		if (!form.kunden_id?.trim()) {
			toast.error(i18n.t('Bitte einen Kunden auswählen.'));
			return;
		}

		loading = true;
		const budgetNum = form.budget.trim() ? parseFloat(form.budget.replace(',', '.')) : null;
		const payload = {
			kunden_id: form.kunden_id.trim(),
			titel: form.titel.trim() || null,
			beschreibung: form.beschreibung.trim() || null,
			status: form.status,
			budget: budgetNum !== null && !Number.isNaN(budgetNum) ? budgetNum : null
		};

		if (editItem) {
			const { error } = await supabase.from('anfragen').update(payload).eq('id', editItem.id);
			loading = false;
			if (error) {
				toast.error(error.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Anfrage wurde aktualisiert.'));
		} else {
			const { error } = await supabase.from('anfragen').insert(payload);
			loading = false;
			if (error) {
				toast.error(error.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Anfrage wurde angelegt.'));
		}
		dispatch('save');
		show = false;
	}
</script>

<Modal size="md" bind:show>
	<div class="modal-content">
		<div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2">
			<div class="text-lg font-medium self-center">{editItem ? i18n.t('Anfrage bearbeiten') : i18n.t('Neue Anfrage')}</div>
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
					<label class="mb-1 text-xs text-gray-500" for="anfrage-kunde">
						{i18n.t('Kunde')} *
					</label>
					<select
						id="anfrage-kunde"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						bind:value={form.kunden_id}
						required
					>
						<option value="">{i18n.t('Bitte Kunde wählen')}</option>
						{#each kunden as k}
							<option value={k.id}>{k.kundennummer} – {k.unternehmensname}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="anfrage-titel">
						{i18n.t('Titel')}
					</label>
					<input
						id="anfrage-titel"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.titel}
						placeholder={i18n.t('Betreff der Anfrage')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="anfrage-status">
						{i18n.t('Status')}
					</label>
					<select
						id="anfrage-status"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						bind:value={form.status}
					>
						{#each statusOptions as opt}
							<option value={opt}>{i18n.t(opt)}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="anfrage-budget">
						{i18n.t('Budget')}
					</label>
					<input
						id="anfrage-budget"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						inputmode="decimal"
						bind:value={form.budget}
						placeholder="0"
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="anfrage-beschreibung">
						{i18n.t('Beschreibung')}
					</label>
					<textarea
						id="anfrage-beschreibung"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 min-h-[80px]"
						bind:value={form.beschreibung}
						placeholder={i18n.t('Beschreibung der Anfrage …')}
					></textarea>
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
