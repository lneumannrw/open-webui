-- Milestone 7: Kunden-Detail Overlay – optional schema extensions for Supabase
-- Run in Supabase SQL Editor if your `kunden` table does not yet have these columns.

-- Add columns to kunden (skip if already present)
ALTER TABLE kunden ADD COLUMN IF NOT EXISTS interne_notizen TEXT;
ALTER TABLE kunden ADD COLUMN IF NOT EXISTS linked_webui_notes_ids TEXT[] DEFAULT '{}';
ALTER TABLE kunden ADD COLUMN IF NOT EXISTS knowledge_collection_ids TEXT[] DEFAULT '{}';
ALTER TABLE kunden ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for logos (run in Supabase Dashboard > Storage or via API)
-- Bucket name: logos
-- Public: yes (so logo_url can be used in img src)
-- Then add RLS policy to allow authenticated uploads/reads as needed.
