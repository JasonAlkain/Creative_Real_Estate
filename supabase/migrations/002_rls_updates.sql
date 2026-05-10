-- Migration: 002_rls_updates.sql
-- Run in Supabase SQL editor AFTER 001_initial_schema.sql

-- Add composite index for Saved page status filtering
CREATE INDEX IF NOT EXISTS saved_properties_user_status_idx
  ON saved_properties(user_id, status);

-- Add DELETE policy for share_links (allow owner to delete their links)
CREATE POLICY "share_links_delete_own" ON share_links
  FOR DELETE USING (auth.uid() = created_by);
