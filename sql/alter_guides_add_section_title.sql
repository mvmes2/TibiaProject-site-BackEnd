ALTER TABLE `guides`
  ADD COLUMN `section_title` JSON DEFAULT NULL COMMENT '{"pt-BR":"...","en":"...","es":"..."}' AFTER `title`;

UPDATE `guides`
SET `section_title` = `title`
WHERE `section_title` IS NULL;