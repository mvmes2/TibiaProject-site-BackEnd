CREATE TABLE IF NOT EXISTS `guides` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`      JSON         NOT NULL COMMENT '{"pt-BR":"...","en":"...","es":"..."}',
  `section_title` JSON      DEFAULT NULL COMMENT '{"pt-BR":"...","en":"...","es":"..."}',
  `slug`       VARCHAR(255) NOT NULL,
  `content`    JSON         NOT NULL COMMENT '{"pt-BR":{"html":"..."},"en":{"html":"..."},"es":{"html":"..."}}',
  `author_id`  INT UNSIGNED NOT NULL,
  `updated_by` INT UNSIGNED DEFAULT NULL COMMENT 'Last admin who updated this guide',
  `menu_label` JSON         DEFAULT NULL COMMENT '{"pt-BR":"...","en":"...","es":"..."}',
  `published`  TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` BIGINT       DEFAULT NULL,
  `updated_at` BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_guides_slug` (`slug`),
  KEY `idx_guides_published` (`published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
