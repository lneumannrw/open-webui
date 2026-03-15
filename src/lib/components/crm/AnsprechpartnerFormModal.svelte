<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Kunde } from '$lib/types/kunden';
	import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';
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
	export let editItem: AnsprechpartnerWithKunde | null = null;
	export let kunden: Kunde[] = [];
	/** When opening for "new", pre-fill this kunden_id (e.g. from overlay context). */
	export let initialKundenId: string | null = null;

	let loading = false;
	let form = {
		kunden_id: '',
		vorname: '',
		nachname: '',
		email: '',
		telefon: '',
		position: ''
	};

	$: if (show) {
		if (editItem) {
			form = {
				kunden_id: editItem.kunden_id ?? '',
				vorname: editItem.vorname ?? '',
				nachname: editItem.nachname ?? '',
				email: editItem.email ?? '',
				telefon: editItem.telefon ?? '',
				position: editItem.position ?? ''
			};
		} else {
			form = {
				kunden_id: initialKundenId ?? '',
				vorname: '',
				nachname: '',
				email: '',
				telefon: '',
				position: ''
			};
		}
	}

	async function submitHandler() {
		if (!form.kunden_id?.trim()) {
			toast.error(i18n.t('Bitte einen Kunden auswählen.'));
			return;
		}

		loading = true;
		const payload = {
			kunden_id: form.kunden_id.trim(),
			vorname: form.vorname.trim() || null,
			nachname: form.nachname.trim() || null,
			email: form.email.trim() || null,
			telefon: form.telefon.trim() || null,
			position: form.position.trim() || null
		};

		if (editItem) {
			const { error } = await supabase.from('ansprechpartner').update(payload).eq('id', editItem.id);
			loading = false;
			if (error) {
				toast.error(error.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Ansprechpartner wurde aktualisiert.'));
		} else {
			const { error } = await supabase.from('ansprechpartner').insert(payload);
			loading = false;
			if (error) {
				toast.error(error.message || i18n.t('Fehler beim Speichern.'));
				return;
			}
			toast.success(i18n.t('Ansprechpartner wurde angelegt.'));
		}
		dispatch('save');
		show = false;
	}
</script>

<Modal size="md" bind:show>
	<div class="modal-content">
		<div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2">
			<div class="text-lg font-medium self-center">{editItem ? i18n.t('Ansprechpartner bearbeiten') : i18n.t('Neuer Ansprechpartner')}</div>
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
					<label class="mb-1 text-xs text-gray-500" for="ap-kunde">
						{i18n.t('Kunde')} *
					</label>
					<select
						id="ap-kunde"
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
					<label class="mb-1 text-xs text-gray-500" for="ap-vorname">
						{i18n.t('Vorname')}
					</label>
					<input
						id="ap-vorname"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.vorname}
						placeholder={i18n.t('Vorname')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="ap-nachname">
						{i18n.t('Nachname')}
					</label>
					<input
						id="ap-nachname"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.nachname}
						placeholder={i18n.t('Nachname')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="ap-email">
						{i18n.t('E-Mail')}
					</label>
					<input
						id="ap-email"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="email"
						bind:value={form.email}
						placeholder="email@firma.de"
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="ap-telefon">
						{i18n.t('Telefon')}
					</label>
					<input
						id="ap-telefon"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="tel"
						bind:value={form.telefon}
						placeholder="+49 123 456789"
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="ap-position">
						{i18n.t('Position')}
					</label>
					<input
						id="ap-position"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.position}
						placeholder={i18n.t('z.B. Geschäftsführung')}
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
