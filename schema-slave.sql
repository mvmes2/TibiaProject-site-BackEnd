CREATE TABLE IF NOT EXISTS `contract_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contract_type_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `contracts_payment_types` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contracts_payment_types_id_unique` (`id`),
  UNIQUE KEY `contracts_payment_types_type_unique` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `contracts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_type` VARCHAR(125) NOT NULL,
  `contract_value` INT NOT NULL,
  `contract_owner_name` VARCHAR(60) NOT NULL,
  `streamer_id` VARCHAR(60) DEFAULT NULL,
  `created_at` BIGINT NOT NULL,
  `contract_start_at` BIGINT NOT NULL,
  `contract_signed` INT NOT NULL,
  `contract_ended_at` BIGINT DEFAULT NULL,
  `active` INT NOT NULL,
  `contract_doc_url` VARCHAR(120) DEFAULT NULL,
  `contract_paid_date` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contracts_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `cupom_type` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cupom_type_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `cupoms` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `streamer_id` INT DEFAULT NULL,
  `cupom_type` INT NOT NULL,
  `cupom_name` VARCHAR(45) NOT NULL,
  `discount_percent_limit` INT DEFAULT NULL,
  `earns_percent_limit` INT DEFAULT NULL,
  `coins_quantity` INT DEFAULT NULL,
  `status` VARCHAR(45) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cupoms_id_unique` (`id`),
  UNIQUE KEY `cupom_name_UNIQUE` (`cupom_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `payer_list` (
  `transactionID` VARCHAR(60) NOT NULL,
  `payerLastUpdated` VARCHAR(60) NOT NULL,
  `payerData` VARCHAR(300) NOT NULL,
  `account_id` INT NOT NULL,
  `buy_time_limit_lock` VARCHAR(60) NOT NULL,
  `createdAt` BIGINT NOT NULL,
  PRIMARY KEY (`transactionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `account_name` VARCHAR(60) NOT NULL,
  `transaction_id` VARCHAR(90) NOT NULL,
  `transaction_type` VARCHAR(60) NOT NULL,
  `product_name` VARCHAR(60) NOT NULL,
  `unity_value` FLOAT DEFAULT NULL,
  `coins_quantity` INT DEFAULT NULL,
  `total_value` FLOAT DEFAULT NULL,
  `fee_percentage` FLOAT DEFAULT NULL,
  `status` VARCHAR(15) NOT NULL,
  `created_date` BIGINT NOT NULL,
  `approved_date` BIGINT DEFAULT NULL,
  `account_email` VARCHAR(60) DEFAULT NULL,
  `payment_currency` VARCHAR(3) DEFAULT NULL,
  `payment_company` VARCHAR(60) DEFAULT NULL,
  `coins_paid_date` BIGINT DEFAULT NULL,
  `cupom_id` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  UNIQUE KEY `payments_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT DEFAULT NULL,
  `product_name` TEXT,
  `unity_value` DOUBLE DEFAULT NULL,
  `coins_quantity` INT DEFAULT NULL,
  `payment_type` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `redeem_cupom_storage` (
  `account_id` INT NOT NULL,
  `cupom_id` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `streamers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `twitch_user_id` VARCHAR(60) DEFAULT NULL,
  `twitch_user_name` VARCHAR(60) DEFAULT NULL,
  `twitch_user_login` VARCHAR(60) DEFAULT NULL,
  `streamer_name` VARCHAR(60) DEFAULT NULL,
  `email` VARCHAR(60) DEFAULT NULL,
  `cupom` VARCHAR(60) DEFAULT NULL,
  `cell_number` VARCHAR(13) DEFAULT NULL,
  `pix_type` VARCHAR(45) DEFAULT NULL,
  `pix_key` VARCHAR(245) DEFAULT NULL,
  `bank_account_number` VARCHAR(45) DEFAULT NULL,
  `bank_agency_number` VARCHAR(45) DEFAULT NULL,
  `bank_name` VARCHAR(45) DEFAULT NULL,
  `streamer_status` VARCHAR(45) NOT NULL DEFAULT 'inactive',
  `document` BIGINT NOT NULL,
  `person_type` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `streamers_id_unique` (`id`),
  UNIQUE KEY `document_UNIQUE` (`document`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `streamers_live_check_time` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `streamer_twitch_id` VARCHAR(60) NOT NULL,
  `streamer_name` VARCHAR(60) NOT NULL,
  `live_id` VARCHAR(60) NOT NULL,
  `live_title` VARCHAR(145) DEFAULT NULL,
  `live_started_at` VARCHAR(60) NOT NULL,
  `live_ended_at` VARCHAR(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `streamers_live_check_time_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` TEXT NOT NULL,
  `author_name` TEXT NOT NULL,
  `account_id` INT NOT NULL,
  `account_email` TEXT NOT NULL,
  `status` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` BIGINT NOT NULL,
  `deletedAt` BIGINT DEFAULT NULL,
  `language` TEXT,
  `closedAt` BIGINT DEFAULT NULL,
  `closed_by_staff_agent` TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tickets_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` INT NOT NULL,
  `image_name` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_images_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tickets_response` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `replyer` TEXT NOT NULL,
  `createdAt` INT NOT NULL,
  `deletedAt` INT DEFAULT NULL,
  `staff_replyer` TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_response_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tickets_response_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `response_id` INT NOT NULL,
  `image_name` TEXT NOT NULL,
  `ticket_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_response_images_id_unique` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `guild_logos` (
  `guild_id` INT NOT NULL,
  `logo_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`guild_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;