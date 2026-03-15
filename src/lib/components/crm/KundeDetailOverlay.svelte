<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Kunde, KundeStatus } from '$lib/types/kunden';
	import type { AnsprechpartnerWithKunde } from '$lib/types/ansprechpartner';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';
	import ArrowUpTray from '$lib/components/icons/ArrowUpTray.svelte';
	import PencilSquare from '$lib/components/icons/PencilSquare.svelte';
	import Link from '$lib/components/icons/Link.svelte';
	import GarbageBin from '$lib/components/icons/GarbageBin.svelte';
	import Database from '$lib/components/icons/Database.svelte';
	import AnsprechpartnerFormModal from '$lib/components/crm/AnsprechpartnerFormModal.svelte';
	import NotesSelector from '$lib/components/crm/NotesSelector.svelte';
	import KnowledgeCollectionSelector from '$lib/components/crm/KnowledgeCollectionSelector.svelte';
	import { getNoteById } from '$lib/apis/notes';
	import { getKnowledgeById } from '$lib/apis/knowledge';

	const i18nRaw = getContext('i18n');
	const i18n =
		i18nRaw && typeof (i18nRaw as any)?.t === 'function'
			? (i18nRaw as { t: (key: string) => string })
			: { t: (key: string) => key };
	const dispatch = createEventDispatcher();

	export let show = false;
	export let kunde: Kunde | null = null;
	/** Liste Kunden für Ansprechpartner-Modal (Kundenauswahl) */
	export let kunden: Kunde[] = [];

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
		branche: ''
	};

	let ansprechpartner: AnsprechpartnerWithKunde[] = [];
	let ansprechpartnerLoading = false;
	let showAnsprechpartnerModal = false;
	let selectedAnsprechpartner: AnsprechpartnerWithKunde | null = null;

	let logoUploading = false;
	let logoInputEl: HTMLInputElement;

	let interneNotizenLocal = '';
	let interneNotizenDebounce: ReturnType<typeof setTimeout> | null = null;
	let notizenSavedHint = false;

	/** Linked WebUI notes: { id, title } for display */
	let linkedNoteRefs: Array<{ id: string; title: string }> = [];
	/** Knowledge collections for display: { id, name } */
	let knowledgeRefs: Array<{ id: string; name: string }> = [];

	$: if (show && kunde) {
		interneNotizenLocal = kunde.interne_notizen ?? '';
		linkedNoteRefs = [];
		knowledgeRefs = [];
		loadLinkedNoteTitles();
		loadKnowledgeRefs();
		form = {
			unternehmensname: kunde.unternehmensname ?? '',
			rechtsform: kunde.rechtsform ?? '',
			status: (kunde.status ?? 'Lead') as KundeStatus,
			email_zentrale: kunde.email_zentrale ?? '',
			telefon_zentrale: kunde.telefon_zentrale ?? '',
			website: kunde.website ?? '',
			strasse: kunde.strasse ?? '',
			plz: kunde.plz ?? '',
			ort: kunde.ort ?? '',
			land: kunde.land ?? 'Deutschland',
			branche: kunde.branche ?? ''
		};
		loadAnsprechpartner();
	}

	async function loadAnsprechpartner() {
		if (!kunde?.id) return;
		ansprechpartnerLoading = true;
		const { data, error } = await supabase
			.from('ansprechpartner')
			.select('*, kunden(kundennummer, unternehmensname)')
			.eq('kunden_id', kunde.id);
		ansprechpartnerLoading = false;
		if (error) {
			toast.error(i18n.t('Ansprechpartner konnten nicht geladen werden.'));
			ansprechpartner = [];
			return;
		}
		ansprechpartner = (data ?? []) as AnsprechpartnerWithKunde[];
	}

	const statusOptions: KundeStatus[] = ['Lead', 'Aktiv', 'Inaktiv', 'Gesperrt'];

	function getInitials(name: string): string {
		const n = (name || '').trim();
		if (!n) return '?';
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return n.slice(0, 2).toUpperCase();
	}

	function getInitialsColor(name: string): string {
		let hash = 0;
		for (let i = 0; i < (name || '').length; i++) hash = (hash << 5) - hash + (name || '').charCodeAt(i);
		const hues = ['emerald', 'blue', 'violet', 'amber', 'rose', 'cyan'];
		const idx = Math.abs(hash) % hues.length;
		const map: Record<string, string> = {
			emerald: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
			blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
			violet: 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
			amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
			rose: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
			cyan: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
		};
		return map[hues[idx]] || map.emerald;
	}

	async function onLogoChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !kunde?.id) return;
		if (!file.type.startsWith('image/')) {
			toast.error(i18n.t('Bitte nur Bilddateien hochladen.'));
			input.value = '';
			return;
		}
		logoUploading = true;
		const ext = file.name.split('.').pop() || 'png';
		const path = `${kunde.id}/logo.${ext}`;
		const { error: uploadError } = await supabase.storage.from('logos').upload(path, file, {
			upsert: true
		});
		if (uploadError) {
			logoUploading = false;
			toast.error(uploadError.message || i18n.t('Logo-Upload fehlgeschlagen.'));
			input.value = '';
			return;
		}
		const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
		const publicUrl = urlData?.publicUrl ?? '';
		const { error: updateError } = await supabase
			.from('kunden')
			.update({ logo_url: publicUrl })
			.eq('id', kunde.id);
		logoUploading = false;
		input.value = '';
		if (updateError) {
			toast.error(updateError.message || i18n.t('Logo konnte nicht gespeichert werden.'));
			return;
		}
		kunde = { ...kunde, logo_url: publicUrl };
		toast.success(i18n.t('Logo wurde aktualisiert.'));
		dispatch('save');
	}

	async function submitHandler() {
		if (!kunde?.id) return;
		if (!form.unternehmensname?.trim()) {
			toast.error(i18n.t('Unternehmensname ist erforderlich.'));
			return;
		}
		loading = true;
		const payload = {
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
			rechtsform: form.rechtsform.trim() || null
		};
		const { error } = await supabase.from('kunden').update(payload).eq('id', kunde.id);
		loading = false;
		if (error) {
			toast.error(error.message || i18n.t('Fehler beim Speichern.'));
			return;
		}
		kunde = { ...kunde, ...payload };
		toast.success(i18n.t('Stammdaten wurden gespeichert.'));
		dispatch('save');
	}

	function openEditAnsprechpartner(ap: AnsprechpartnerWithKunde | null) {
		selectedAnsprechpartner = ap;
		showAnsprechpartnerModal = true;
	}

	function openNewAnsprechpartner() {
		selectedAnsprechpartner = null;
		showAnsprechpartnerModal = true;
	}

	function handleAnsprechpartnerSave() {
		loadAnsprechpartner();
	}

	async function loadLinkedNoteTitles() {
		const ids = kunde?.linked_webui_notes_ids ?? [];
		if (ids.length === 0) return;
		const token = localStorage.token;
		linkedNoteRefs = await Promise.all(
			ids.map(async (id) => {
				const note = await getNoteById(token, id).catch(() => null);
				return { id, title: note?.title ?? id };
			})
		);
	}

	async function loadKnowledgeRefs() {
		const ids = kunde?.knowledge_collection_ids ?? [];
		if (ids.length === 0) return;
		const token = localStorage.token;
		knowledgeRefs = (
			await Promise.all(
				ids.map(async (id) => {
					const kb = await getKnowledgeById(token, id).catch(() => null);
					return kb ? { id, name: kb.name ?? id } : null;
				})
			)
		).filter(Boolean) as Array<{ id: string; name: string }>;
	}

	function onInterneNotizenInput() {
		if (interneNotizenDebounce) clearTimeout(interneNotizenDebounce);
		interneNotizenDebounce = setTimeout(async () => {
			interneNotizenDebounce = null;
			if (!kunde?.id) return;
			const { error } = await supabase
				.from('kunden')
				.update({ interne_notizen: interneNotizenLocal })
				.eq('id', kunde.id);
			if (error) {
				toast.error(error.message || i18n.t('Notizen konnten nicht gespeichert werden.'));
				return;
			}
			kunde = { ...kunde, interne_notizen: interneNotizenLocal };
			notizenSavedHint = true;
			setTimeout(() => (notizenSavedHint = false), 2000);
			dispatch('save');
		}, 500);
	}

	function onNoteSelect(e: CustomEvent<{ id: string; title: string }>) {
		const item = e.detail;
		if (!kunde || linkedNoteRefs.some((n) => n.id === item.id)) return;
		linkedNoteRefs = [...linkedNoteRefs, { id: item.id, title: item.title }];
		saveLinkedNoteIds();
	}

	function removeLinkedNote(id: string) {
		linkedNoteRefs = linkedNoteRefs.filter((n) => n.id !== id);
		saveLinkedNoteIds();
	}

	async function saveLinkedNoteIds() {
		if (!kunde?.id) return;
		const ids = linkedNoteRefs.map((n) => n.id);
		const { error } = await supabase
			.from('kunden')
			.update({ linked_webui_notes_ids: ids })
			.eq('id', kunde.id);
		if (error) {
			toast.error(error.message || i18n.t('Verknüpfung konnte nicht gespeichert werden.'));
			return;
		}
		kunde = { ...kunde, linked_webui_notes_ids: ids };
		dispatch('save');
	}

	function onKnowledgeSelect(e: CustomEvent<{ id: string; name: string }>) {
		const item = e.detail;
		if (!kunde || knowledgeRefs.some((k) => k.id === item.id)) return;
		knowledgeRefs = [...knowledgeRefs, { id: item.id, name: item.name }];
		saveKnowledgeCollectionIds();
	}

	function removeKnowledge(id: string) {
		knowledgeRefs = knowledgeRefs.filter((k) => k.id !== id);
		saveKnowledgeCollectionIds();
	}

	async function saveKnowledgeCollectionIds() {
		if (!kunde?.id) return;
		const ids = knowledgeRefs.map((k) => k.id);
		const { error } = await supabase
			.from('kunden')
			.update({ knowledge_collection_ids: ids })
			.eq('id', kunde.id);
		if (error) {
			toast.error(error.message || i18n.t('Wissensspeicher-Verknüpfung konnte nicht gespeichert werden.'));
			return;
		}
		kunde = { ...kunde, knowledge_collection_ids: ids };
		dispatch('save');
	}
</script>

<Modal size="xl-overlay" bind:show>
	<div class="modal-content flex flex-col h-full max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
		<!-- Header -->
		<div class="flex justify-between items-center shrink-0 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
			<div class="flex items-center gap-3 min-w-0">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
					{kunde?.unternehmensname ?? i18n.t('Kunde')}
				</h2>
				{#if kunde?.status}
					<span
						class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize {kunde.status === 'Aktiv'
							? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
							: kunde.status === 'Lead'
								? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
								: kunde.status === 'Inaktiv'
									? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
									: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}"
					>
						{i18n.t(kunde.status)}
					</span>
				{/if}
			</div>
			<button
				class="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
				aria-label={i18n.t('Schließen')}
				on:click={() => (show = false)}
			>
				<XMark className="size-5 text-gray-600 dark:text-gray-400" />
			</button>
		</div>

		<!-- Main: Sidebar + Content (50/50) -->
		<div class="flex flex-1 min-h-0 overflow-hidden">
			<!-- Sidebar: kein Scroll, Formular nutzt Platz in 2 Spalten -->
			<aside
				class="w-1/2 min-w-0 flex flex-col border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
			>
				{#if kunde}
					<!-- Logo + Stammdaten in einer Zeile: Logo links, Form rechts -->
					<div class="flex flex-1 min-h-0 p-5 gap-6">
						<!-- Logo / Avatar (kompakt links) -->
						<div class="shrink-0 flex flex-col items-center">
							<button
								type="button"
								class="relative group rounded-2xl flex shrink-0 items-center justify-center overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 size-20 md:size-24 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
								aria-label={i18n.t('Logo hochladen')}
								on:click={() => logoInputEl?.click()}
								disabled={logoUploading}
							>
								{#if logoUploading}
									<Spinner className="size-8 text-gray-500" />
								{:else if kunde.logo_url}
									<img
										src={kunde.logo_url}
										alt=""
										class="size-full object-cover"
									/>
								{:else}
									<span
										class="text-2xl md:text-3xl font-semibold select-none {getInitialsColor(kunde.unternehmensname ?? '')}"
									>
										{getInitials(kunde.unternehmensname ?? '')}
									</span>
								{/if}
								<div
									class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-2xl"
								>
									<ArrowUpTray className="size-8 text-white" />
								</div>
							</button>
							<input
								bind:this={logoInputEl}
								type="file"
								accept="image/*"
								class="hidden"
								on:change={onLogoChange}
							/>
						</div>

						<!-- Stammdaten Form: 2 Spalten, kompakt -->
						<form
							class="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-3 content-start"
							on:submit|preventDefault={submitHandler}
						>
							<div class="col-span-2 flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-unternehmensname">{i18n.t('Unternehmensname')} *</label>
								<input
									id="kunde-unternehmensname"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400"
									type="text"
									bind:value={form.unternehmensname}
									placeholder={i18n.t('z.B. Muster GmbH')}
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-status">{i18n.t('Status')}</label>
								<select
									id="kunde-status"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 capitalize"
									bind:value={form.status}
								>
									{#each statusOptions as opt}
										<option value={opt}>{i18n.t(opt)}</option>
									{/each}
								</select>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-rechtsform">{i18n.t('Rechtsform')}</label>
								<input
									id="kunde-rechtsform"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="text"
									bind:value={form.rechtsform}
									placeholder="GmbH, AG, …"
								/>
							</div>
							<div class="col-span-2 flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-email">{i18n.t('E-Mail')}</label>
								<input
									id="kunde-email"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="email"
									bind:value={form.email_zentrale}
									placeholder="zentrale@firma.de"
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-telefon">{i18n.t('Telefon')}</label>
								<input
									id="kunde-telefon"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="tel"
									bind:value={form.telefon_zentrale}
									placeholder="+49 123 456789"
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-website">{i18n.t('Website')}</label>
								<input
									id="kunde-website"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="url"
									bind:value={form.website}
									placeholder="https://"
								/>
							</div>
							<div class="col-span-2 flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-strasse">{i18n.t('Straße')}</label>
								<input
									id="kunde-strasse"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="text"
									bind:value={form.strasse}
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-plz">{i18n.t('PLZ')}</label>
								<input
									id="kunde-plz"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="text"
									bind:value={form.plz}
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-ort">{i18n.t('Ort')}</label>
								<input
									id="kunde-ort"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="text"
									bind:value={form.ort}
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-land">{i18n.t('Land')}</label>
								<input
									id="kunde-land"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="text"
									bind:value={form.land}
								/>
							</div>
							<div class="flex flex-col">
								<label class="mb-1 text-xs text-gray-500" for="kunde-branche">{i18n.t('Branche')}</label>
								<input
									id="kunde-branche"
									class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
									type="text"
									bind:value={form.branche}
								/>
							</div>
							<div class="col-span-2 pt-1">
								<button
									class="w-full px-3.5 py-2 text-sm font-medium bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 transition rounded-full flex items-center justify-center gap-2"
									type="submit"
									disabled={loading}
								>
									{i18n.t('Stammdaten speichern')}
									{#if loading}
										<Spinner className="size-4 shrink-0" />
									{/if}
								</button>
							</div>
						</form>
					</div>
				{/if}
			</aside>

			<!-- Content -->
			<main class="w-1/2 min-w-0 overflow-y-auto p-5 space-y-6">
				<!-- Ansprechpartner -->
				<section>
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
							{i18n.t('Ansprechpartner')}
						</h3>
						<button
							type="button"
							class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
							on:click={openNewAnsprechpartner}
						>
							{i18n.t('Neuer Ansprechpartner')}
						</button>
					</div>
					{#if ansprechpartnerLoading}
						<div class="flex items-center gap-2 text-sm text-gray-500">
							<Spinner className="size-4" />
							{i18n.t('Laden…')}
						</div>
					{:else if ansprechpartner.length === 0}
						<p class="text-sm text-gray-500 dark:text-gray-400">{i18n.t('Keine Ansprechpartner.')}</p>
					{:else}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{#each ansprechpartner as ap (ap.id)}
								<div
									class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-850 flex flex-col gap-2"
								>
									<div class="flex items-start justify-between gap-2">
										<span class="font-medium text-gray-900 dark:text-gray-100">
											{ap.vorname || ap.nachname
												? [ap.vorname, ap.nachname].filter(Boolean).join(' ')
												: i18n.t('Unbenannt')}
										</span>
										<button
											class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400"
											aria-label={i18n.t('Bearbeiten')}
											on:click={() => openEditAnsprechpartner(ap)}
										>
											<PencilSquare className="size-4" />
										</button>
									</div>
									{#if ap.position}
										<span class="text-xs text-gray-500 dark:text-gray-400">{ap.position}</span>
									{/if}
									<div class="flex flex-wrap gap-2 mt-1">
										{#if ap.email}
											<a
												href="mailto:{ap.email}"
												class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
											>
												<Link className="size-3.5" />
												{i18n.t('Mail')}
											</a>
										{/if}
										{#if ap.telefon}
											<a
												href="tel:{ap.telefon}"
												class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
											>
												<Link className="size-3.5" />
												{i18n.t('Tel')}
											</a>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>

				<!-- Interne Notizen (Supabase, debounced auto-save) -->
				<section>
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
						{i18n.t('Interne Notizen')}
					</h3>
					<textarea
						class="w-full text-sm bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 min-h-[120px] outline-none focus:ring-2 focus:ring-gray-400 resize-y"
						placeholder={i18n.t('Interne Notizen …')}
						bind:value={interneNotizenLocal}
						on:input={onInterneNotizenInput}
					></textarea>
					{#if notizenSavedHint}
						<p class="text-xs text-green-600 dark:text-green-400 mt-1">{i18n.t('Gespeichert')}</p>
					{/if}
				</section>

				<!-- Verknüpfte WebUI-Notizen -->
				<section>
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
						{i18n.t('Verknüpfte WebUI-Notizen')}
					</h3>
					{#if linkedNoteRefs.length > 0}
						<div class="flex flex-wrap gap-2 mb-2">
							{#each linkedNoteRefs as ref (ref.id)}
								<span
									class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
								>
									<span class="line-clamp-1 max-w-[180px]">{ref.title || ref.id}</span>
									<button
										type="button"
										class="shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
										aria-label={i18n.t('Entfernen')}
										on:click={() => removeLinkedNote(ref.id)}
									>
										<GarbageBin className="size-3.5 text-gray-500" />
									</button>
								</span>
							{/each}
						</div>
					{/if}
					<NotesSelector on:select={onNoteSelect}>
						<button
							type="button"
							class="px-3.5 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 outline outline-1 outline-gray-200 dark:outline-gray-700 rounded-full"
						>
							{i18n.t('Notiz verknüpfen')}
						</button>
					</NotesSelector>
				</section>

				<!-- Verknüpfte Wissensspeicher -->
				<section>
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
						{i18n.t('Verknüpfte Wissensspeicher')}
					</h3>
					{#if knowledgeRefs.length > 0}
						<div class="flex flex-wrap gap-2 mb-2">
							{#each knowledgeRefs as ref (ref.id)}
								<span
									class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
								>
									<Database className="size-4 shrink-0 text-gray-500" />
									<span class="line-clamp-1 max-w-[180px]">{ref.name}</span>
									<button
										type="button"
										class="shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
										aria-label={i18n.t('Entfernen')}
										on:click={() => removeKnowledge(ref.id)}
									>
										<GarbageBin className="size-3.5 text-gray-500" />
									</button>
								</span>
							{/each}
						</div>
					{/if}
					<KnowledgeCollectionSelector on:select={onKnowledgeSelect}>
						<button
							type="button"
							class="px-3.5 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 outline outline-1 outline-gray-200 dark:outline-gray-700 rounded-full"
						>
							{i18n.t('Wissensspeicher verknüpfen')}
						</button>
					</KnowledgeCollectionSelector>
				</section>
			</main>
		</div>
	</div>
</Modal>

<AnsprechpartnerFormModal
	bind:show={showAnsprechpartnerModal}
	editItem={selectedAnsprechpartner}
	kunden={kunden}
	initialKundenId={kunde?.id ?? null}
	on:save={handleAnsprechpartnerSave}
/>
