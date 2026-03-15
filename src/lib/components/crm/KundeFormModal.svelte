<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { KundeStatus } from '$lib/types/kunden';
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

	let loading = false;
	let form = {
		unternehmensname: '',
		rechtsform: '',
		status: 'Lead' as KundeStatus,
		email_zentrale: '',
		telefon_zentrale: '',
		website: '',
		strasse: '',
		plz: '',
		ort: '',
		land: 'Deutschland',
		branche: '',
		notizen: ''
	};

	$: if (show) {
		form = {
			unternehmensname: '',
			rechtsform: '',
			status: 'Lead',
			email_zentrale: '',
			telefon_zentrale: '',
			website: '',
			strasse: '',
			plz: '',
			ort: '',
			land: 'Deutschland',
			branche: '',
			notizen: ''
		};
	}

	const statusOptions: KundeStatus[] = ['Lead', 'Aktiv', 'Inaktiv', 'Gesperrt'];

	async function submitHandler() {
		if (!form.unternehmensname?.trim()) {
			toast.error(i18n.t('Unternehmensname ist erforderlich.'));
			return;
		}

		loading = true;
		const payload: Record<string, unknown> = {
			unternehmensname: form.unternehmensname.trim(),
			status: form.status,
			email_zentrale: form.email_zentrale.trim() || null,
			telefon_zentrale: form.telefon_zentrale.trim() || null,
			website: form.website.trim() || null,
			strasse: form.strasse.trim() || null,
			plz: form.plz.trim() || null,
			ort: form.ort.trim() || null,
			land: form.land.trim() || 'Deutschland',
			branche: form.branche.trim() || null,
			notizen: form.notizen.trim() || null,
			rechtsform: form.rechtsform.trim() || null
		};

		const { error } = await supabase.from('kunden').insert(payload);

		loading = false;
		if (error) {
			toast.error(error.message || i18n.t('Fehler beim Speichern.'));
			return;
		}
		toast.success(i18n.t('Kunde wurde angelegt.'));
		dispatch('save');
		show = false;
	}
</script>

<Modal size="md" bind:show>
	<div class="modal-content">
		<div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2">
			<div class="text-lg font-medium self-center">{i18n.t('Neuer Kunde')}</div>
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
					<label class="mb-1 text-xs text-gray-500" for="kunde-unternehmensname">
						{i18n.t('Unternehmensname')} *
					</label>
					<input
						id="kunde-unternehmensname"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="text"
						bind:value={form.unternehmensname}
						placeholder={i18n.t('z.B. Muster GmbH')}
						required
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="kunde-status">
						{i18n.t('Status')}
					</label>
					<select
						id="kunde-status"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 capitalize"
						bind:value={form.status}
					>
						{#each statusOptions as opt}
							<option value={opt}>{i18n.t(opt)}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="kunde-email">
						{i18n.t('E-Mail')}
					</label>
					<input
						id="kunde-email"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="email"
						bind:value={form.email_zentrale}
						placeholder={i18n.t('zentrale@firma.de')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="kunde-telefon">
						{i18n.t('Telefon')}
					</label>
					<input
						id="kunde-telefon"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="tel"
						bind:value={form.telefon_zentrale}
						placeholder={i18n.t('+49 123 456789')}
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="kunde-website">
						{i18n.t('Website')}
					</label>
					<input
						id="kunde-website"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
						type="url"
						bind:value={form.website}
						placeholder="https://"
					/>
				</div>

				<div class="flex flex-col w-full mb-3">
					<label class="mb-1 text-xs text-gray-500" for="kunde-notizen">
						{i18n.t('Notizen')}
					</label>
					<textarea
						id="kunde-notizen"
						class="w-full text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 min-h-[80px]"
						bind:value={form.notizen}
						placeholder={i18n.t('Interne Notizen …')}
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
