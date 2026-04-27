CREATE TABLE IF NOT EXISTS `worlds` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `serverName` VARCHAR(100) DEFAULT NULL,
  `server_name` VARCHAR(100) DEFAULT NULL,
  `pvptype` ENUM('pvp', 'no-pvp', 'pvp-enforced') NOT NULL DEFAULT 'pvp',
  `location` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `worlds_serverName_unique` (`serverName`),
  UNIQUE KEY `worlds_server_name_unique` (`server_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

UPDATE `worlds`
SET `server_name` = `serverName`
WHERE (`server_name` IS NULL OR `server_name` = '') AND `serverName` IS NOT NULL;

UPDATE `worlds`
SET `serverName` = `server_name`
WHERE (`serverName` IS NULL OR `serverName` = '') AND `server_name` IS NOT NULL;

CREATE TABLE IF NOT EXISTS `players_comment` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` INT NOT NULL,
  `comment` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_comment_player_id_unique` (`player_id`),
  CONSTRAINT `players_comment_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `players_titles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `in_use` TINYINT(1) DEFAULT '0',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `players_titles_player_id_index` (`player_id`),
  KEY `players_titles_in_use_index` (`in_use`),
  CONSTRAINT `players_titles_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `vocations` (
  `vocation_id` INT UNSIGNED NOT NULL,
  `vocation_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vocation_id`),
  UNIQUE KEY `vocations_vocation_name_unique` (`vocation_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `vocations` (`vocation_id`, `vocation_name`, `description`)
VALUES
  (0, 'None', 'No vocation'),
  (1, 'Sorcerer', 'Master of fire and energy'),
  (2, 'Druid', 'Master of nature and healing'),
  (3, 'Paladin', 'Master of ranged combat and healing'),
  (4, 'Knight', 'Master of close combat and defense')
ON DUPLICATE KEY UPDATE
  `vocation_name` = VALUES(`vocation_name`),
  `description` = VALUES(`description`);

ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `country` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `loginHash` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `isBanned` TINYINT(1) DEFAULT '0';
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `banReason` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `day_end_premmy` BIGINT DEFAULT '0';
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `web_lastlogin` BIGINT DEFAULT '0';
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `web_flags` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `change_pass_token` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `recovery_key` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `password2` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `login_token` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `email_verified` TINYINT(1) DEFAULT '0';
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `created` TINYINT(1) DEFAULT '0';

ALTER TABLE `players` ADD COLUMN IF NOT EXISTS `world_id` INT UNSIGNED DEFAULT NULL;
ALTER TABLE `players` ADD COLUMN IF NOT EXISTS `hidden` TINYINT(1) DEFAULT '0';
ALTER TABLE `players` ADD COLUMN IF NOT EXISTS `deletedAt` INT UNSIGNED DEFAULT '0';
ALTER TABLE `players` ADD COLUMN IF NOT EXISTS `createdAt` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `players` ADD COLUMN IF NOT EXISTS `created_at` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `players` ADD COLUMN IF NOT EXISTS `comment` TEXT NULL;

UPDATE `players`
SET `created_at` = `createdAt`
WHERE (`created_at` IS NULL OR `created_at` = 0) AND `createdAt` IS NOT NULL;

ALTER TABLE `houses` ADD COLUMN IF NOT EXISTS `guildhall` TINYINT(1) NOT NULL DEFAULT '0';

CREATE TABLE IF NOT EXISTS `gold_class_dim` (
  `id` smallint UNSIGNED NOT NULL,
  `name` varchar(32) NOT NULL,
  `description` varchar(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_class_dim_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_state_dim` (
  `id` smallint UNSIGNED NOT NULL,
  `name` varchar(32) NOT NULL,
  `description` varchar(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_state_dim_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_mechanism_dim` (
  `id` smallint UNSIGNED NOT NULL,
  `name` varchar(48) NOT NULL,
  `description` varchar(160) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_mechanism_dim_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_origin_root_dim` (
  `id` smallint UNSIGNED NOT NULL,
  `name` varchar(48) NOT NULL,
  `description` varchar(160) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_origin_root_dim_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_source_type_dim` (
  `id` smallint UNSIGNED NOT NULL,
  `name` varchar(32) NOT NULL,
  `description` varchar(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_source_type_dim_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_monster_dim` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `normalized_name` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_monster_dim_normalized_name_unique` (`normalized_name`),
  KEY `gold_monster_dim_name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_audit_event_fact` (
  `occurred_at` bigint UNSIGNED NOT NULL,
  `partition_month` bigint UNSIGNED NOT NULL,
  `boot_id` bigint UNSIGNED NOT NULL,
  `event_seq` bigint UNSIGNED NOT NULL,
  `tx_id` bigint UNSIGNED DEFAULT NULL,
  `class_id` smallint UNSIGNED NOT NULL,
  `state_id` smallint UNSIGNED NOT NULL,
  `mechanism_id` smallint UNSIGNED NOT NULL,
  `origin_root_id` smallint UNSIGNED NOT NULL,
  `actor_player_id` int UNSIGNED DEFAULT NULL,
  `beneficiary_player_id` int UNSIGNED DEFAULT NULL,
  `counterparty_player_id` int UNSIGNED DEFAULT NULL,
  `killer_player_id` int UNSIGNED DEFAULT NULL,
  `looter_player_id` int UNSIGNED DEFAULT NULL,
  `npc_dim_id` int UNSIGNED DEFAULT NULL,
  `monster_dim_id` int UNSIGNED DEFAULT NULL,
  `house_id` int UNSIGNED DEFAULT NULL,
  `source_type_id` smallint UNSIGNED NOT NULL,
  `source_ref_id` bigint UNSIGNED DEFAULT NULL,
  `amount` bigint UNSIGNED NOT NULL,
  `inventory_delta` bigint NOT NULL DEFAULT '0',
  `bank_delta` bigint NOT NULL DEFAULT '0',
  `pending_delta` bigint NOT NULL DEFAULT '0',
  `flags` int UNSIGNED NOT NULL DEFAULT '0',
  `source_name_snapshot` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`partition_month`, `occurred_at`, `boot_id`, `event_seq`),
  KEY `gold_audit_event_actor_idx` (`actor_player_id`, `occurred_at`),
  KEY `gold_audit_event_beneficiary_idx` (`beneficiary_player_id`, `occurred_at`),
  KEY `gold_audit_event_counterparty_idx` (`counterparty_player_id`, `occurred_at`),
  KEY `gold_audit_event_class_mechanism_idx` (`class_id`, `mechanism_id`, `occurred_at`),
  KEY `gold_audit_event_monster_idx` (`monster_dim_id`, `occurred_at`),
  KEY `gold_audit_event_origin_idx` (`origin_root_id`, `occurred_at`),
  KEY `gold_audit_event_house_idx` (`house_id`, `occurred_at`),
  CONSTRAINT `gold_audit_event_class_fk` FOREIGN KEY (`class_id`) REFERENCES `gold_class_dim` (`id`),
  CONSTRAINT `gold_audit_event_state_fk` FOREIGN KEY (`state_id`) REFERENCES `gold_state_dim` (`id`),
  CONSTRAINT `gold_audit_event_mechanism_fk` FOREIGN KEY (`mechanism_id`) REFERENCES `gold_mechanism_dim` (`id`),
  CONSTRAINT `gold_audit_event_origin_fk` FOREIGN KEY (`origin_root_id`) REFERENCES `gold_origin_root_dim` (`id`),
  CONSTRAINT `gold_audit_event_source_type_fk` FOREIGN KEY (`source_type_id`) REFERENCES `gold_source_type_dim` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_pending_world` (
  `pending_id` bigint UNSIGNED NOT NULL,
  `boot_id` bigint UNSIGNED NOT NULL,
  `created_at` bigint UNSIGNED NOT NULL,
  `state_id` smallint UNSIGNED NOT NULL,
  `origin_root_id` smallint UNSIGNED NOT NULL,
  `monster_dim_id` int UNSIGNED DEFAULT NULL,
  `killer_player_id` int UNSIGNED DEFAULT NULL,
  `corpse_owner_player_id` int UNSIGNED DEFAULT NULL,
  `current_root_type_id` smallint UNSIGNED NOT NULL,
  `current_root_ref_id` bigint UNSIGNED DEFAULT NULL,
  `current_value` bigint UNSIGNED NOT NULL,
  `initial_value` bigint UNSIGNED NOT NULL,
  `flags` int UNSIGNED NOT NULL DEFAULT '0',
  `source_name_snapshot` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`boot_id`, `pending_id`),
  KEY `gold_pending_world_monster_idx` (`monster_dim_id`, `created_at`),
  KEY `gold_pending_world_state_idx` (`state_id`, `created_at`),
  KEY `gold_pending_world_root_idx` (`current_root_type_id`, `current_root_ref_id`),
  KEY `gold_pending_world_killer_idx` (`killer_player_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_audit_rollup_hourly` (
  `bucket_hour` bigint UNSIGNED NOT NULL,
  `class_id` smallint UNSIGNED NOT NULL,
  `mechanism_id` smallint UNSIGNED NOT NULL,
  `origin_root_id` smallint UNSIGNED NOT NULL,
  `actor_player_id` int UNSIGNED NOT NULL DEFAULT '0',
  `total_amount` bigint UNSIGNED NOT NULL DEFAULT '0',
  `event_count` bigint UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`bucket_hour`, `class_id`, `mechanism_id`, `origin_root_id`, `actor_player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_audit_rollup_daily` (
  `bucket_day` bigint UNSIGNED NOT NULL,
  `class_id` smallint UNSIGNED NOT NULL,
  `mechanism_id` smallint UNSIGNED NOT NULL,
  `origin_root_id` smallint UNSIGNED NOT NULL,
  `actor_player_id` int UNSIGNED NOT NULL DEFAULT '0',
  `total_amount` bigint UNSIGNED NOT NULL DEFAULT '0',
  `event_count` bigint UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`bucket_day`, `class_id`, `mechanism_id`, `origin_root_id`, `actor_player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_audit_anomaly` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` bigint UNSIGNED NOT NULL,
  `severity` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `player_id` int UNSIGNED DEFAULT NULL,
  `mechanism_id` smallint UNSIGNED DEFAULT NULL,
  `code` varchar(64) NOT NULL,
  `expected_inventory_gold` bigint DEFAULT NULL,
  `actual_inventory_gold` bigint DEFAULT NULL,
  `expected_bank_gold` bigint DEFAULT NULL,
  `actual_bank_gold` bigint DEFAULT NULL,
  `notes` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `gold_audit_anomaly_created_idx` (`created_at`),
  KEY `gold_audit_anomaly_code_idx` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_db_balance_mutation` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `changed_at` bigint UNSIGNED NOT NULL,
  `player_id` int UNSIGNED NOT NULL,
  `player_name_snapshot` varchar(255) NOT NULL DEFAULT '',
  `previous_balance` bigint UNSIGNED NOT NULL,
  `new_balance` bigint UNSIGNED NOT NULL,
  `delta` bigint NOT NULL,
  `source_context` varchar(64) NOT NULL DEFAULT 'external/manual',
  `is_external` tinyint(1) NOT NULL DEFAULT '1',
  `db_user` varchar(128) DEFAULT NULL,
  `db_current_user` varchar(128) DEFAULT NULL,
  `connection_id` bigint UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gold_db_balance_mutation_changed_idx` (`changed_at`),
  KEY `gold_db_balance_mutation_player_idx` (`player_id`, `changed_at`),
  KEY `gold_db_balance_mutation_external_idx` (`is_external`, `changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `gold_server_stock_snapshot` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `snapshot_at` bigint UNSIGNED NOT NULL,
  `boot_id` bigint UNSIGNED NOT NULL,
  `trigger_name` varchar(32) NOT NULL DEFAULT 'periodic',
  `scan_duration_ms` bigint UNSIGNED NOT NULL DEFAULT '0',
  `online_players` int UNSIGNED NOT NULL DEFAULT '0',
  `offline_players` int UNSIGNED NOT NULL DEFAULT '0',
  `bank_gold` bigint UNSIGNED NOT NULL DEFAULT '0',
  `inventory_gold` bigint UNSIGNED NOT NULL DEFAULT '0',
  `depot_gold` bigint UNSIGNED NOT NULL DEFAULT '0',
  `house_gold` bigint UNSIGNED NOT NULL DEFAULT '0',
  `world_gold` bigint UNSIGNED NOT NULL DEFAULT '0',
  `total_gold` bigint UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `gold_server_stock_snapshot_at_idx` (`snapshot_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT IGNORE INTO `gold_class_dim` (`id`, `name`, `description`) VALUES
  (1, 'FAUCET', 'Gold entrou na economia realizada'),
  (2, 'SINK', 'Gold saiu definitivamente da economia'),
  (3, 'TRANSFER', 'Gold trocou de dono ou compartimento sem alterar massa monetaria'),
  (4, 'PENDING', 'Gold ainda nao realizado no mundo');

INSERT IGNORE INTO `gold_state_dim` (`id`, `name`, `description`) VALUES
  (1, 'PENDING', 'Estado pendente no mundo'),
  (2, 'REALIZED', 'Evento economico consolidado'),
  (3, 'DECAYED', 'Gold pendente destruido por decay'),
  (4, 'ROLLED_BACK', 'Operacao revertida tecnicamente');

INSERT IGNORE INTO `gold_mechanism_dim` (`id`, `name`, `description`) VALUES
  (1, 'MONSTER_GOLD_PENDING', 'Gold dropado por monstro ainda pendente'),
  (2, 'MONSTER_GOLD_CLAIM', 'Gold direto de monstro realizado por player'),
  (3, 'MONSTER_GOLD_DECAY_UNCLAIMED', 'Gold direto perdido por decay antes do claim'),
  (4, 'NPC_ITEM_SALE', 'Jogador vendeu item para NPC'),
  (5, 'QUEST_DIRECT_REWARD', 'Reward direta de quest'),
  (6, 'TASK_DIRECT_REWARD', 'Reward direta de task'),
  (7, 'GAMBLING_PAYOUT', 'Payout de sistema de gambling'),
  (8, 'NPC_ITEM_PURCHASE', 'Compra de item em NPC'),
  (9, 'NPC_TRAVEL_FEE', 'Viagem paga'),
  (10, 'NPC_SPELL_PURCHASE', 'Compra de spell'),
  (11, 'NPC_BLESSING_PURCHASE', 'Compra de blessing'),
  (12, 'NPC_PROMOTION_PURCHASE', 'Promotion paga'),
  (13, 'NPC_SERVICE_FEE', 'Servico pago em NPC'),
  (14, 'HOUSE_WORLD_PURCHASE', 'Compra de casa do mundo'),
  (15, 'HOUSE_RENT', 'Aluguel de casa'),
  (16, 'HOUSE_TRADE_TRANSFER', 'Transferencia principal em trade de casa'),
  (17, 'HOUSE_TRADE_TAX', 'Taxa do servidor em trade de casa'),
  (18, 'BANK_DEPOSIT', 'Deposito bancario'),
  (19, 'BANK_WITHDRAW', 'Saque bancario'),
  (20, 'BANK_TRANSFER_PLAYER', 'Transferencia bancaria entre jogadores'),
  (21, 'LOW_LEVEL_UNCLASSIFIED_ADD', 'Adicao bruta de gold sem contexto auditado'),
  (22, 'LOW_LEVEL_UNCLASSIFIED_REMOVE', 'Remocao bruta de gold sem contexto auditado'),
  (23, 'SERVER_TAX_OTHER', 'Outras taxas do servidor'),
  (24, 'ADMIN_COMMAND_GOLD_GRANT', 'Gold injetado por comando administrativo');

INSERT IGNORE INTO `gold_origin_root_dim` (`id`, `name`, `description`) VALUES
  (1, 'MONSTER_DIRECT_COIN', 'Gold dropado diretamente por monstro'),
  (2, 'MONSTER_LOOT_ITEM', 'Item de monstro que futuramente virou gold'),
  (3, 'WORLD_STATIC_GOLD', 'Gold estatico de mundo ou mapa'),
  (4, 'WORLD_STATIC_ITEM', 'Item estatico que futuramente virou gold'),
  (5, 'QUEST_REWARD', 'Reward direta de quest'),
  (6, 'TASK_REWARD', 'Reward direta de task'),
  (7, 'GAMBLING_SYSTEM', 'Origem em sistema de gambling'),
  (8, 'NPC_COMMERCE', 'Comercio com NPC'),
  (9, 'NPC_SERVICE', 'Servico cobrado por NPC'),
  (10, 'HOUSE_SYSTEM', 'Origem ou sink ligado a casas'),
  (11, 'BANK_SYSTEM', 'Fluxo bancario'),
  (12, 'SCRIPT_ADMIN', 'Script administrativo'),
  (13, 'UNKNOWN', 'Origem ainda nao classificada');

INSERT IGNORE INTO `gold_source_type_dim` (`id`, `name`, `description`) VALUES
  (1, 'SYSTEM', 'Core do servidor'),
  (2, 'NPC', 'NPC como fonte de acao'),
  (3, 'PLAYER', 'Outro player como contraparte'),
  (4, 'HOUSE', 'Sistema de house'),
  (5, 'MONSTER', 'Monstro como origem'),
  (6, 'LUA', 'Fluxo vindo de Lua'),
  (7, 'SCRIPT', 'Fluxo de script legado'),
  (8, 'WORLD', 'Estado estatico do mundo'),
  (9, 'DATABASE', 'Persistencia/DB'),
  (10, 'INTERNAL', 'Uso interno do core');

DROP TRIGGER IF EXISTS `gold_players_balance_audit_after_update`;
CREATE TRIGGER `gold_players_balance_audit_after_update`
AFTER UPDATE ON `players`
FOR EACH ROW
INSERT INTO `gold_db_balance_mutation`
(`changed_at`, `player_id`, `player_name_snapshot`, `previous_balance`, `new_balance`, `delta`, `source_context`, `is_external`, `db_user`, `db_current_user`, `connection_id`)
SELECT
  CAST(TIMESTAMPDIFF(MICROSECOND, '1970-01-01 00:00:00', UTC_TIMESTAMP(3)) DIV 1000 AS UNSIGNED),
  NEW.`id`,
  NEW.`name`,
  OLD.`balance`,
  NEW.`balance`,
  CAST(NEW.`balance` AS SIGNED) - CAST(OLD.`balance` AS SIGNED),
  COALESCE(NULLIF(@economy_balance_mutation_source, ''), 'external/manual'),
  IF(COALESCE(NULLIF(@economy_balance_mutation_source, ''), '') = '', 1, 0),
  USER(),
  CURRENT_USER(),
  CONNECTION_ID()
WHERE OLD.`balance` <> NEW.`balance`;

CREATE OR REPLACE VIEW `gold_audit_admin_intervention_v` AS
SELECT
  'AUDIT_FACT' AS `record_source`,
  CAST(f.`event_seq` AS UNSIGNED) AS `source_row_id`,
  f.`occurred_at` AS `occurred_at`,
  'FAUCET' AS `event_class`,
  'ADMIN_COMMAND_GOLD_GRANT' AS `mechanism_name`,
  f.`actor_player_id` AS `actor_player_id`,
  actor.`name` AS `actor_player_name`,
  f.`beneficiary_player_id` AS `subject_player_id`,
  subject.`name` AS `subject_player_name`,
  f.`amount` AS `amount`,
  f.`inventory_delta` AS `inventory_delta`,
  f.`bank_delta` AS `bank_delta`,
  CAST(NULL AS SIGNED) AS `balance_before`,
  CAST(NULL AS SIGNED) AS `balance_after`,
  f.`source_ref_id` AS `source_ref_id`,
  f.`source_name_snapshot` AS `source_name_snapshot`,
  CAST(NULL AS CHAR(64)) AS `db_source_context`,
  CAST(NULL AS CHAR(128)) AS `db_user`,
  CAST(NULL AS CHAR(128)) AS `db_current_user`,
  CAST(NULL AS UNSIGNED) AS `db_connection_id`
FROM `gold_audit_event_fact` f
LEFT JOIN `players` actor ON actor.`id` = f.`actor_player_id`
LEFT JOIN `players` subject ON subject.`id` = f.`beneficiary_player_id`
WHERE f.`mechanism_id` = 24
UNION ALL
SELECT
  'DB_TRIGGER' AS `record_source`,
  m.`id` AS `source_row_id`,
  m.`changed_at` AS `occurred_at`,
  CASE WHEN m.`delta` >= 0 THEN 'FAUCET' ELSE 'SINK' END AS `event_class`,
  'DATABASE_EXTERNAL_BALANCE_CHANGE' AS `mechanism_name`,
  NULL AS `actor_player_id`,
  NULL AS `actor_player_name`,
  m.`player_id` AS `subject_player_id`,
  m.`player_name_snapshot` AS `subject_player_name`,
  CAST(ABS(m.`delta`) AS UNSIGNED) AS `amount`,
  0 AS `inventory_delta`,
  m.`delta` AS `bank_delta`,
  CAST(m.`previous_balance` AS SIGNED) AS `balance_before`,
  CAST(m.`new_balance` AS SIGNED) AS `balance_after`,
  NULL AS `source_ref_id`,
  m.`source_context` AS `source_name_snapshot`,
  m.`source_context` AS `db_source_context`,
  m.`db_user` AS `db_user`,
  m.`db_current_user` AS `db_current_user`,
  m.`connection_id` AS `db_connection_id`
FROM `gold_db_balance_mutation` m
WHERE m.`is_external` = 1;