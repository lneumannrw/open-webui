<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Kunde } from '$lib/types/kunden';
	import type { VertragWithKunde } from '$lib/types/vertraege';
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
	export let editItem: VertragWithKunde | null = null;
	export let kunden: Kunde[] = [];
	/** When opening for "new", pre-fill kunde_id (e.g. from customer detail page). */
	export let defaultKundeId = '';

	let loading = false;
	let form = {
		kunde_id: '',
		vertragsnummer: '',
		bezeichnung: '',
		wert: '',
		startdatum: '',
		enddatum: ''
	};

	$: if (show) {
		if (editItem) {
			form = {
				kunde_id: editItem.kunde_id ?? '',
				vertragsnummer: editItem.vertragsnummer ?? '',
				bezeichnung: editItem.bezeichnung ?? '',
				wert: editItem.wert != null ? String(editItem.wert) : '',
				startdatum: editItem.startdatum ?? '',
				enddatum: editItem.enddatum ?? ''
			};
		} else {
			form = {
				kunde_id: defaultKundeId || '',
				vertragsnummer: '',
				bezeichnung: '',
				wert: '',
				startdatum: '',
				enddatum: ''
			};
		}
	}

	async function submitHandler() {
		if (!form.kunde_id?.trim()) {
			toast.error(i18n.t('Bitte einen Kunden auswählen.'));
			return;
		}

		loading = true;
		const wertNum = form.wert.trim() ? parseFloat(form.wert.replace(',', '.')) : null;
		const payload = {
			kunde_id: form.kunde_id.trim(),
			vertragsnummer: form.vertragsnummer.trim() || null,
			bezeichnung: form.bezeichnung.trim() || null,
			wert: wertNum !== null && !Number.isNaN(wertNum) ? wertNum : null,
			startdatum: form.startdatum.trim() || null,
			enddatum: form.enddatum.trim() || null
		};

		if (editItem) {
			const { error } = await supabase.from('vertraege').update(payload).eq('id', editItem.id);
			loading = false;
			if (error) {
				toast.error(error.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Vertrag wurde aktualisiert.'));
		} else {
			const { error } = await supabase.from('vertraege').insert(payload);
			loading = false;
			if (error) {
				toast.error(error.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Vertrag wurde angelegt.'));
		}
		dispatch('save');
		show = false;
	}
</script>

<Modal size="md" bind:show>
	<div class="modal-content">
		<div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2">
			<div class="text-lg font-medium self-center">{editItem ? i18n.t('Vertrag bearbeiten') : i18n.t('Neuer Vertrag')}</div>
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
					<label class="mb-1 text-xs text-gray-500" for="vertrag-kunde">
						{i18n.t('Kunde')} *
					</label>
					<select
						id="vertrag-kunde"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						bind:value={form.kunde_id}
						required
					>
						<option value="">{i18n.t('Bitte Kunde wählen')}</option>
						{#each kunden as k}
							<option value={k.id}>{k.kundennummer} – {k.unternehmensname}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="vertrag-vertragsnummer">
						{i18n.t('Vertragsnummer')}
					</label>
					<input
						id="vertrag-vertragsnummer"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.vertragsnummer}
						placeholder={i18n.t('z.B. V-2024-001')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="vertrag-bezeichnung">
						{i18n.t('Bezeichnung')}
					</label>
					<input
						id="vertrag-bezeichnung"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.bezeichnung}
						placeholder={i18n.t('Vertragsbezeichnung')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="vertrag-wert">
						{i18n.t('Wert')}
					</label>
					<input
						id="vertrag-wert"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						inputmode="decimal"
						bind:value={form.wert}
						placeholder="0"
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="vertrag-startdatum">
						{i18n.t('Startdatum')}
					</label>
					<input
						id="vertrag-startdatum"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="date"
						bind:value={form.startdatum}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="vertrag-enddatum">
						{i18n.t('Enddatum')}
					</label>
					<input
						id="vertrag-enddatum"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="date"
						bind:value={form.enddatum}
					/>
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
