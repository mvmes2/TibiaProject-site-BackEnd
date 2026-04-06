-- Add updated_by column to track which admin last updated each guide
ALTER TABLE `guides`
  ADD COLUMN `updated_by` INT UNSIGNED DEFAULT NULL COMMENT 'Last admin who updated this guide'
  AFTER `author_id`;

-- Backfill: set updated_by = author_id for existing rows (the creator is the last known updater)
UPDATE `guides` SET `updated_by` = `author_id` WHERE `updated_by` IS NULL;
