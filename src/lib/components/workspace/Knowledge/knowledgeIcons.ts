/**
 * Shared icon set for Knowledge bases. Used by KnowledgeIconPicker and for rendering selected icons.
 */
import type { ComponentType } from 'svelte';
import FolderOpen from '$lib/components/icons/FolderOpen.svelte';
import ArchiveBox from '$lib/components/icons/ArchiveBox.svelte';
import DocumentArrowUpSolid from '$lib/components/icons/DocumentArrowUpSolid.svelte';
import DocumentDuplicate from '$lib/components/icons/DocumentDuplicate.svelte';
import Bookmark from '$lib/components/icons/Bookmark.svelte';
import Clipboard from '$lib/components/icons/Clipboard.svelte';
import QueueList from '$lib/components/icons/QueueList.svelte';
import ListBullet from '$lib/components/icons/ListBullet.svelte';
import Search from '$lib/components/icons/Search.svelte';
import DatabaseSettings from '$lib/components/icons/DatabaseSettings.svelte';
import ChartBar from '$lib/components/icons/ChartBar.svelte';
import CodeBracket from '$lib/components/icons/CodeBracket.svelte';
import Sparkles from '$lib/components/icons/Sparkles.svelte';
import Tag from '$lib/components/icons/Tag.svelte';
import Grid from '$lib/components/icons/Grid.svelte';

export const KNOWLEDGE_ICON_IDS = [
	'FolderOpen',
	'ArchiveBox',
	'DocumentArrowUpSolid',
	'DocumentDuplicate',
	'Bookmark',
	'Clipboard',
	'QueueList',
	'ListBullet',
	'Search',
	'DatabaseSettings',
	'ChartBar',
	'CodeBracket',
	'Sparkles',
	'Tag',
	'Grid'
] as const;

export type KnowledgeIconId = (typeof KNOWLEDGE_ICON_IDS)[number];

export const KNOWLEDGE_ICON_MAP: Record<string, ComponentType> = {
	FolderOpen,
	ArchiveBox,
	DocumentArrowUpSolid,
	DocumentDuplicate,
	Bookmark,
	Clipboard,
	QueueList,
	ListBullet,
	Search,
	DatabaseSettings,
	ChartBar,
	CodeBracket,
	Sparkles,
	Tag,
	Grid
};

export const DEFAULT_KNOWLEDGE_ICON: KnowledgeIconId = 'FolderOpen';

export function getKnowledgeIconComponent(iconId: string | undefined): ComponentType | undefined {
	if (!iconId) return undefined;
	return KNOWLEDGE_ICON_MAP[iconId];
}

/** Tag color options for Knowledge meta.tag_color. Order and IDs used in color picker grid. */
export const KNOWLEDGE_TAG_COLORS = ['gray', 'red', 'yellow', 'green', 'blue', 'purple'] as const;

export type KnowledgeTagColor = (typeof KNOWLEDGE_TAG_COLORS)[number];

/** Tailwind background class for each tag color (for swatch display). */
export const TAG_COLOR_SWATCH_CLASS: Record<KnowledgeTagColor, string> = {
	gray: 'bg-gray-500',
	red: 'bg-red-500',
	yellow: 'bg-yellow-500',
	green: 'bg-green-500',
	blue: 'bg-blue-500',
	purple: 'bg-purple-500'
};
