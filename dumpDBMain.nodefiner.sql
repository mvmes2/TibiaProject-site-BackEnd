-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: projectmain
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `otserv_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `otserv_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `otserv_db`;

--
-- Table structure for table `account_ban_history`
--

DROP TABLE IF EXISTS `account_ban_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_ban_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `reason` varchar(255) NOT NULL,
  `banned_at` bigint NOT NULL,
  `expired_at` bigint NOT NULL,
  `banned_by` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  KEY `banned_by` (`banned_by`),
  CONSTRAINT `account_bans_history_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_bans_history_player_fk` FOREIGN KEY (`banned_by`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_ban_history`
--

LOCK TABLES `account_ban_history` WRITE;
/*!40000 ALTER TABLE `account_ban_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_ban_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_bans`
--

DROP TABLE IF EXISTS `account_bans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_bans` (
  `account_id` int unsigned NOT NULL,
  `reason` varchar(255) NOT NULL,
  `banned_at` bigint NOT NULL,
  `expires_at` bigint NOT NULL,
  `banned_by` int NOT NULL,
  PRIMARY KEY (`account_id`),
  KEY `banned_by` (`banned_by`),
  CONSTRAINT `account_bans_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_bans_player_fk` FOREIGN KEY (`banned_by`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_bans`
--

LOCK TABLES `account_bans` WRITE;
/*!40000 ALTER TABLE `account_bans` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_bans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_viplist`
--

DROP TABLE IF EXISTS `account_viplist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_viplist` (
  `account_id` int unsigned NOT NULL COMMENT 'id of account whose viplist entry it is',
  `player_id` int NOT NULL COMMENT 'id of target player of viplist entry',
  `description` varchar(128) NOT NULL DEFAULT '',
  `icon` tinyint unsigned NOT NULL DEFAULT '0',
  `notify` tinyint(1) NOT NULL DEFAULT '0',
  UNIQUE KEY `account_viplist_unique` (`account_id`,`player_id`),
  KEY `account_id` (`account_id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `account_viplist_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `account_viplist_player_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_viplist`
--

LOCK TABLES `account_viplist` WRITE;
/*!40000 ALTER TABLE `account_viplist` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_viplist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `password` char(40) NOT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `premdays` int NOT NULL DEFAULT '0',
  `lastday` int unsigned NOT NULL DEFAULT '0',
  `type` tinyint unsigned NOT NULL DEFAULT '1',
  `coins` int unsigned NOT NULL DEFAULT '0',
  `tournament_coins` int unsigned NOT NULL DEFAULT '0',
  `silver_pack` int DEFAULT '0',
  `gold_pack` int DEFAULT '0',
  `diamond_pack` int DEFAULT '0',
  `creation` int unsigned NOT NULL DEFAULT '0',
  `recruiter` int DEFAULT '0',
  `country` varchar(100) DEFAULT NULL,
  `loginHash` varchar(100) DEFAULT NULL,
  `isBanned` tinyint(1) DEFAULT '0',
  `banReason` varchar(255) DEFAULT NULL,
  `day_end_premmy` bigint DEFAULT '0',
  `web_lastlogin` bigint DEFAULT '0',
  `web_flag` varchar(255) DEFAULT NULL,
  `change_pass_token` varchar(255) DEFAULT NULL,
  `recovery_key` varchar(100) DEFAULT NULL,
  `password2` varchar(100) DEFAULT NULL,
  `login_token` varchar(500) DEFAULT NULL,
  `createdAt` int unsigned DEFAULT '0',
  `email_verified` tinyint(1) DEFAULT '0',
  `created` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'god','21298df8a3277357ee55b01df9530b535cf08ec1','@god',0,0,5,0,0,0,0,0,0,0,NULL,NULL,0,NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0),(2,'mvmes23','2d0fc5ccb9c6677a6e6febbf59d58dd358b741fc','mvmes23@gmail.com',0,0,1,1500,0,0,0,0,0,0,'bra','ACf0ECg0',0,NULL,0,1771384869,NULL,NULL,NULL,'Mvm19018009***','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoibXZtZXMyM0BnbWFpbC5jb20iLCJpZCI6MiwibmFtZSI6Im12bWVzMjMiLCJsb2dpbkhhc2giOiJBQ2YwRUNnMCIsImNvdW50cnkiOiJicmEiLCJjb2lucyI6MTUwMH0sImlhdCI6MTc3MTM4NDg2OSwiZXhwIjoxNzcxNDcxMjY5fQ.y-TbFH5YWVvu_jxgT3j0WP3_MJ958wIanNKZMGLwh40',1771378251,0,0);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boosted_boss`
--

DROP TABLE IF EXISTS `boosted_boss`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boosted_boss` (
  `looktype` int NOT NULL DEFAULT '136',
  `lookfeet` int NOT NULL DEFAULT '0',
  `looklegs` int NOT NULL DEFAULT '0',
  `lookhead` int NOT NULL DEFAULT '0',
  `lookbody` int NOT NULL DEFAULT '0',
  `lookaddons` int NOT NULL DEFAULT '0',
  `lookmount` int DEFAULT '0',
  `date` varchar(250) NOT NULL DEFAULT '',
  `boostname` text,
  `raceid` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boosted_boss`
--

LOCK TABLES `boosted_boss` WRITE;
/*!40000 ALTER TABLE `boosted_boss` DISABLE KEYS */;
INSERT INTO `boosted_boss` VALUES (136,0,0,0,0,0,0,'0','default','0');
/*!40000 ALTER TABLE `boosted_boss` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boosted_creature`
--

DROP TABLE IF EXISTS `boosted_creature`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boosted_creature` (
  `looktype` int NOT NULL DEFAULT '136',
  `lookfeet` int NOT NULL DEFAULT '0',
  `looklegs` int NOT NULL DEFAULT '0',
  `lookhead` int NOT NULL DEFAULT '0',
  `lookbody` int NOT NULL DEFAULT '0',
  `lookaddons` int NOT NULL DEFAULT '0',
  `lookmount` int DEFAULT '0',
  `date` varchar(250) NOT NULL DEFAULT '',
  `boostname` text,
  `raceid` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boosted_creature`
--

LOCK TABLES `boosted_creature` WRITE;
/*!40000 ALTER TABLE `boosted_creature` DISABLE KEYS */;
INSERT INTO `boosted_creature` VALUES (136,0,0,0,0,0,0,'0','default','0');
/*!40000 ALTER TABLE `boosted_creature` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coins_transactions`
--

DROP TABLE IF EXISTS `coins_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coins_transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `type` tinyint unsigned NOT NULL,
  `amount` int unsigned NOT NULL,
  `description` varchar(3500) NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `coins_transactions_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coins_transactions`
--

LOCK TABLES `coins_transactions` WRITE;
/*!40000 ALTER TABLE `coins_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `coins_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_reward_history`
--

DROP TABLE IF EXISTS `daily_reward_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_reward_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `daystreak` smallint NOT NULL DEFAULT '0',
  `player_id` int NOT NULL,
  `timestamp` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `daily_reward_history_player_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_reward_history`
--

LOCK TABLES `daily_reward_history` WRITE;
/*!40000 ALTER TABLE `daily_reward_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_reward_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forge_history`
--

DROP TABLE IF EXISTS `forge_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forge_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `action_type` int NOT NULL DEFAULT '0',
  `description` text NOT NULL,
  `is_success` tinyint NOT NULL DEFAULT '0',
  `bonus` tinyint NOT NULL DEFAULT '0',
  `done_at` bigint NOT NULL,
  `done_at_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `cost` bigint unsigned NOT NULL DEFAULT '0',
  `gained` bigint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `forge_history_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forge_history`
--

LOCK TABLES `forge_history` WRITE;
/*!40000 ALTER TABLE `forge_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `forge_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_storage`
--

DROP TABLE IF EXISTS `global_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_storage` (
  `key` varchar(32) NOT NULL,
  `value` text NOT NULL,
  UNIQUE KEY `global_storage_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_storage`
--

LOCK TABLES `global_storage` WRITE;
/*!40000 ALTER TABLE `global_storage` DISABLE KEYS */;
/*!40000 ALTER TABLE `global_storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild_invites`
--

DROP TABLE IF EXISTS `guild_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild_invites` (
  `player_id` int NOT NULL DEFAULT '0',
  `guild_id` int NOT NULL DEFAULT '0',
  `date` int NOT NULL,
  PRIMARY KEY (`player_id`,`guild_id`),
  KEY `guild_id` (`guild_id`),
  CONSTRAINT `guild_invites_guild_fk` FOREIGN KEY (`guild_id`) REFERENCES `guilds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guild_invites_player_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild_invites`
--

LOCK TABLES `guild_invites` WRITE;
/*!40000 ALTER TABLE `guild_invites` DISABLE KEYS */;
/*!40000 ALTER TABLE `guild_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild_membership`
--

DROP TABLE IF EXISTS `guild_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild_membership` (
  `player_id` int NOT NULL,
  `guild_id` int NOT NULL,
  `rank_id` int NOT NULL,
  `nick` varchar(15) NOT NULL DEFAULT '',
  PRIMARY KEY (`player_id`),
  KEY `guild_id` (`guild_id`),
  KEY `rank_id` (`rank_id`),
  CONSTRAINT `guild_membership_guild_fk` FOREIGN KEY (`guild_id`) REFERENCES `guilds` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `guild_membership_player_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `guild_membership_rank_fk` FOREIGN KEY (`rank_id`) REFERENCES `guild_ranks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild_membership`
--

LOCK TABLES `guild_membership` WRITE;
/*!40000 ALTER TABLE `guild_membership` DISABLE KEYS */;
/*!40000 ALTER TABLE `guild_membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild_ranks`
--

DROP TABLE IF EXISTS `guild_ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild_ranks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guild_id` int NOT NULL COMMENT 'guild',
  `name` varchar(255) NOT NULL COMMENT 'rank name',
  `level` int NOT NULL COMMENT 'rank level - leader, vice, member, maybe something else',
  PRIMARY KEY (`id`),
  KEY `guild_id` (`guild_id`),
  CONSTRAINT `guild_ranks_fk` FOREIGN KEY (`guild_id`) REFERENCES `guilds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild_ranks`
--

LOCK TABLES `guild_ranks` WRITE;
/*!40000 ALTER TABLE `guild_ranks` DISABLE KEYS */;
/*!40000 ALTER TABLE `guild_ranks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild_wars`
--

DROP TABLE IF EXISTS `guild_wars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild_wars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guild1` int NOT NULL DEFAULT '0',
  `guild2` int NOT NULL DEFAULT '0',
  `name1` varchar(255) NOT NULL,
  `name2` varchar(255) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `started` bigint NOT NULL DEFAULT '0',
  `ended` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `guild1` (`guild1`),
  KEY `guild2` (`guild2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild_wars`
--

LOCK TABLES `guild_wars` WRITE;
/*!40000 ALTER TABLE `guild_wars` DISABLE KEYS */;
/*!40000 ALTER TABLE `guild_wars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guilds`
--

DROP TABLE IF EXISTS `guilds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guilds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` int NOT NULL DEFAULT '1',
  `name` varchar(255) NOT NULL,
  `ownerid` int NOT NULL,
  `creationdata` int NOT NULL,
  `motd` varchar(255) NOT NULL DEFAULT '',
  `residence` int NOT NULL DEFAULT '0',
  `balance` bigint unsigned NOT NULL DEFAULT '0',
  `points` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `guilds_name_unique` (`name`),
  UNIQUE KEY `guilds_owner_unique` (`ownerid`),
  CONSTRAINT `guilds_ownerid_fk` FOREIGN KEY (`ownerid`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guilds`
--

LOCK TABLES `guilds` WRITE;
/*!40000 ALTER TABLE `guilds` DISABLE KEYS */;
/*!40000 ALTER TABLE `guilds` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/  /*!50003 TRIGGER `oncreate_guilds` AFTER INSERT ON `guilds` FOR EACH ROW BEGIN

        INSERT INTO `guild_ranks` (`name`, `level`, `guild_id`) VALUES ('The Leader', 3, NEW.`id`);

        INSERT INTO `guild_ranks` (`name`, `level`, `guild_id`) VALUES ('Vice-Leader', 2, NEW.`id`);

        INSERT INTO `guild_ranks` (`name`, `level`, `guild_id`) VALUES ('Member', 1, NEW.`id`);

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `guildwar_kills`
--

DROP TABLE IF EXISTS `guildwar_kills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guildwar_kills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `killer` varchar(50) NOT NULL,
  `target` varchar(50) NOT NULL,
  `killerguild` int NOT NULL DEFAULT '0',
  `targetguild` int NOT NULL DEFAULT '0',
  `warid` int NOT NULL DEFAULT '0',
  `time` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guildwar_kills_unique` (`warid`),
  KEY `warid` (`warid`),
  CONSTRAINT `guildwar_kills_warid_fk` FOREIGN KEY (`warid`) REFERENCES `guild_wars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guildwar_kills`
--

LOCK TABLES `guildwar_kills` WRITE;
/*!40000 ALTER TABLE `guildwar_kills` DISABLE KEYS */;
/*!40000 ALTER TABLE `guildwar_kills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `house_lists`
--

DROP TABLE IF EXISTS `house_lists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `house_lists` (
  `house_id` int NOT NULL,
  `listid` int NOT NULL,
  `list` text NOT NULL,
  KEY `house_id` (`house_id`),
  CONSTRAINT `houses_list_house_fk` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `house_lists`
--

LOCK TABLES `house_lists` WRITE;
/*!40000 ALTER TABLE `house_lists` DISABLE KEYS */;
/*!40000 ALTER TABLE `house_lists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `houses`
--

DROP TABLE IF EXISTS `houses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `houses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner` int NOT NULL,
  `paid` int unsigned NOT NULL DEFAULT '0',
  `warnings` int NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `rent` int NOT NULL DEFAULT '0',
  `town_id` int NOT NULL DEFAULT '0',
  `bid` int NOT NULL DEFAULT '0',
  `bid_end` int NOT NULL DEFAULT '0',
  `last_bid` int NOT NULL DEFAULT '0',
  `highest_bidder` int NOT NULL DEFAULT '0',
  `size` int NOT NULL DEFAULT '0',
  `guildid` int DEFAULT NULL,
  `beds` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`),
  KEY `town_id` (`town_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `houses`
--

LOCK TABLES `houses` WRITE;
/*!40000 ALTER TABLE `houses` DISABLE KEYS */;
/*!40000 ALTER TABLE `houses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ip_bans`
--

DROP TABLE IF EXISTS `ip_bans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ip_bans` (
  `ip` int NOT NULL,
  `reason` varchar(255) NOT NULL,
  `banned_at` bigint NOT NULL,
  `expires_at` bigint NOT NULL,
  `banned_by` int NOT NULL,
  PRIMARY KEY (`ip`),
  KEY `banned_by` (`banned_by`),
  CONSTRAINT `ip_bans_players_fk` FOREIGN KEY (`banned_by`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ip_bans`
--

LOCK TABLES `ip_bans` WRITE;
/*!40000 ALTER TABLE `ip_bans` DISABLE KEYS */;
/*!40000 ALTER TABLE `ip_bans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations`
--

DROP TABLE IF EXISTS `knex_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations`
--

LOCK TABLES `knex_migrations` WRITE;
/*!40000 ALTER TABLE `knex_migrations` DISABLE KEYS */;
INSERT INTO `knex_migrations` VALUES (1,'20260217000000_add_founder_packs_to_accounts.js',1,'2026-02-17 23:05:35'),(2,'20260218000000_create_missing_main_tables.js',2,'2026-02-17 23:06:18'),(3,'20260218100000_add_missing_columns_to_players_and_accounts.js',3,'2026-02-17 23:18:15'),(4,'20260218110000_create_vocations_table.js',4,'2026-02-17 23:39:34'),(5,'20260218120000_add_missing_columns_to_players.js',5,'2026-02-17 23:47:35'),(6,'20260218130000_add_createdAt_to_accounts.js',6,'2026-02-18 01:27:41'),(7,'20260218140000_add_email_verified_and_created_to_accounts.js',7,'2026-02-18 01:32:55'),(8,'20260218150000_convert_players_createdAt_to_epoch.js',8,'2026-02-18 02:05:41');
/*!40000 ALTER TABLE `knex_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations_lock`
--

DROP TABLE IF EXISTS `knex_migrations_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations_lock` (
  `index` int unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations_lock`
--

LOCK TABLES `knex_migrations_lock` WRITE;
/*!40000 ALTER TABLE `knex_migrations_lock` DISABLE KEYS */;
INSERT INTO `knex_migrations_lock` VALUES (1,0);
/*!40000 ALTER TABLE `knex_migrations_lock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `market_history`
--

DROP TABLE IF EXISTS `market_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `market_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `sale` tinyint(1) NOT NULL DEFAULT '0',
  `itemtype` int unsigned NOT NULL,
  `amount` smallint unsigned NOT NULL,
  `price` bigint unsigned NOT NULL DEFAULT '0',
  `expires_at` bigint unsigned NOT NULL,
  `inserted` bigint unsigned NOT NULL,
  `state` tinyint unsigned NOT NULL,
  `tier` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`,`sale`),
  CONSTRAINT `market_history_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `market_history`
--

LOCK TABLES `market_history` WRITE;
/*!40000 ALTER TABLE `market_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `market_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `market_offers`
--

DROP TABLE IF EXISTS `market_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `market_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `sale` tinyint(1) NOT NULL DEFAULT '0',
  `itemtype` int unsigned NOT NULL,
  `amount` smallint unsigned NOT NULL,
  `created` bigint unsigned NOT NULL,
  `anonymous` tinyint(1) NOT NULL DEFAULT '0',
  `price` bigint unsigned NOT NULL DEFAULT '0',
  `tier` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sale` (`sale`,`itemtype`),
  KEY `created` (`created`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `market_offers_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `market_offers`
--

LOCK TABLES `market_offers` WRITE;
/*!40000 ALTER TABLE `market_offers` DISABLE KEYS */;
/*!40000 ALTER TABLE `market_offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_bosstiary`
--

DROP TABLE IF EXISTS `player_bosstiary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_bosstiary` (
  `player_id` int NOT NULL,
  `bossIdSlotOne` int NOT NULL DEFAULT '0',
  `bossIdSlotTwo` int NOT NULL DEFAULT '0',
  `removeTimes` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_bosstiary`
--

LOCK TABLES `player_bosstiary` WRITE;
/*!40000 ALTER TABLE `player_bosstiary` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_bosstiary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_charms`
--

DROP TABLE IF EXISTS `player_charms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_charms` (
  `player_guid` int NOT NULL,
  `charm_points` varchar(250) DEFAULT NULL,
  `charm_expansion` tinyint(1) DEFAULT NULL,
  `rune_wound` int DEFAULT NULL,
  `rune_enflame` int DEFAULT NULL,
  `rune_poison` int DEFAULT NULL,
  `rune_freeze` int DEFAULT NULL,
  `rune_zap` int DEFAULT NULL,
  `rune_curse` int DEFAULT NULL,
  `rune_cripple` int DEFAULT NULL,
  `rune_parry` int DEFAULT NULL,
  `rune_dodge` int DEFAULT NULL,
  `rune_adrenaline` int DEFAULT NULL,
  `rune_numb` int DEFAULT NULL,
  `rune_cleanse` int DEFAULT NULL,
  `rune_bless` int DEFAULT NULL,
  `rune_scavenge` int DEFAULT NULL,
  `rune_gut` int DEFAULT NULL,
  `rune_low_blow` int DEFAULT NULL,
  `rune_divine` int DEFAULT NULL,
  `rune_vamp` int DEFAULT NULL,
  `rune_void` int DEFAULT NULL,
  `UsedRunesBit` varchar(250) DEFAULT NULL,
  `UnlockedRunesBit` varchar(250) DEFAULT NULL,
  `tracker list` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_charms`
--

LOCK TABLES `player_charms` WRITE;
/*!40000 ALTER TABLE `player_charms` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_charms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_deaths`
--

DROP TABLE IF EXISTS `player_deaths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_deaths` (
  `player_id` int NOT NULL,
  `time` bigint unsigned NOT NULL DEFAULT '0',
  `level` int NOT NULL DEFAULT '1',
  `killed_by` varchar(255) NOT NULL,
  `is_player` tinyint(1) NOT NULL DEFAULT '1',
  `mostdamage_by` varchar(100) NOT NULL,
  `mostdamage_is_player` tinyint(1) NOT NULL DEFAULT '0',
  `unjustified` tinyint(1) NOT NULL DEFAULT '0',
  `mostdamage_unjustified` tinyint(1) NOT NULL DEFAULT '0',
  KEY `player_id` (`player_id`),
  KEY `killed_by` (`killed_by`),
  KEY `mostdamage_by` (`mostdamage_by`),
  CONSTRAINT `player_deaths_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_deaths`
--

LOCK TABLES `player_deaths` WRITE;
/*!40000 ALTER TABLE `player_deaths` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_deaths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_depotitems`
--

DROP TABLE IF EXISTS `player_depotitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_depotitems` (
  `player_id` int NOT NULL,
  `sid` int NOT NULL COMMENT 'any given range eg 0-100 will be reserved for depot lockers and all > 100 will be then normal items inside depots',
  `pid` int NOT NULL DEFAULT '0',
  `itemtype` int NOT NULL DEFAULT '0',
  `count` int NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL,
  UNIQUE KEY `player_depotitems_unique` (`player_id`,`sid`),
  CONSTRAINT `player_depotitems_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_depotitems`
--

LOCK TABLES `player_depotitems` WRITE;
/*!40000 ALTER TABLE `player_depotitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_depotitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_hirelings`
--

DROP TABLE IF EXISTS `player_hirelings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_hirelings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint unsigned NOT NULL DEFAULT '0',
  `sex` tinyint unsigned NOT NULL DEFAULT '0',
  `posx` int NOT NULL DEFAULT '0',
  `posy` int NOT NULL DEFAULT '0',
  `posz` int NOT NULL DEFAULT '0',
  `lookbody` int NOT NULL DEFAULT '0',
  `lookfeet` int NOT NULL DEFAULT '0',
  `lookhead` int NOT NULL DEFAULT '0',
  `looklegs` int NOT NULL DEFAULT '0',
  `looktype` int NOT NULL DEFAULT '136',
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `player_hirelings_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_hirelings`
--

LOCK TABLES `player_hirelings` WRITE;
/*!40000 ALTER TABLE `player_hirelings` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_hirelings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_inboxitems`
--

DROP TABLE IF EXISTS `player_inboxitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_inboxitems` (
  `player_id` int NOT NULL,
  `sid` int NOT NULL,
  `pid` int NOT NULL DEFAULT '0',
  `itemtype` int NOT NULL DEFAULT '0',
  `count` int NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL,
  UNIQUE KEY `player_inboxitems_unique` (`player_id`,`sid`),
  CONSTRAINT `player_inboxitems_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_inboxitems`
--

LOCK TABLES `player_inboxitems` WRITE;
/*!40000 ALTER TABLE `player_inboxitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_inboxitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_items`
--

DROP TABLE IF EXISTS `player_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_items` (
  `player_id` int NOT NULL DEFAULT '0',
  `pid` int NOT NULL DEFAULT '0',
  `sid` int NOT NULL DEFAULT '0',
  `itemtype` int NOT NULL DEFAULT '0',
  `count` int NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL,
  KEY `player_id` (`player_id`),
  KEY `sid` (`sid`),
  CONSTRAINT `player_items_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_items`
--

LOCK TABLES `player_items` WRITE;
/*!40000 ALTER TABLE `player_items` DISABLE KEYS */;
INSERT INTO `player_items` VALUES (8,3,101,2853,1,''),(8,4,102,3561,1,''),(8,101,104,3291,1,''),(8,101,105,3270,1,''),(8,101,106,3293,1,''),(8,101,107,21401,1,''),(8,101,108,3585,1,'');
/*!40000 ALTER TABLE `player_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_kills`
--

DROP TABLE IF EXISTS `player_kills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_kills` (
  `player_id` int NOT NULL,
  `time` bigint unsigned NOT NULL DEFAULT '0',
  `target` int NOT NULL,
  `unavenged` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_kills`
--

LOCK TABLES `player_kills` WRITE;
/*!40000 ALTER TABLE `player_kills` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_kills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_misc`
--

DROP TABLE IF EXISTS `player_misc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_misc` (
  `player_id` int NOT NULL,
  `info` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_misc`
--

LOCK TABLES `player_misc` WRITE;
/*!40000 ALTER TABLE `player_misc` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_misc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_namelocks`
--

DROP TABLE IF EXISTS `player_namelocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_namelocks` (
  `player_id` int NOT NULL,
  `reason` varchar(255) NOT NULL,
  `namelocked_at` bigint NOT NULL,
  `namelocked_by` int NOT NULL,
  UNIQUE KEY `player_namelocks_unique` (`player_id`),
  KEY `namelocked_by` (`namelocked_by`),
  CONSTRAINT `player_namelocks_players2_fk` FOREIGN KEY (`namelocked_by`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `player_namelocks_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_namelocks`
--

LOCK TABLES `player_namelocks` WRITE;
/*!40000 ALTER TABLE `player_namelocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_namelocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_prey`
--

DROP TABLE IF EXISTS `player_prey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_prey` (
  `player_id` int NOT NULL,
  `slot` tinyint(1) NOT NULL,
  `state` tinyint(1) NOT NULL,
  `raceid` varchar(250) NOT NULL,
  `option` tinyint(1) NOT NULL,
  `bonus_type` tinyint(1) NOT NULL,
  `bonus_rarity` tinyint(1) NOT NULL,
  `bonus_percentage` varchar(250) NOT NULL,
  `bonus_time` varchar(250) NOT NULL,
  `free_reroll` bigint NOT NULL,
  `monster_list` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_prey`
--

LOCK TABLES `player_prey` WRITE;
/*!40000 ALTER TABLE `player_prey` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_prey` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_rewards`
--

DROP TABLE IF EXISTS `player_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_rewards` (
  `player_id` int NOT NULL,
  `sid` int NOT NULL,
  `pid` int NOT NULL DEFAULT '0',
  `itemtype` int NOT NULL DEFAULT '0',
  `count` int NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL,
  UNIQUE KEY `player_rewards_unique` (`player_id`,`sid`),
  CONSTRAINT `player_rewards_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_rewards`
--

LOCK TABLES `player_rewards` WRITE;
/*!40000 ALTER TABLE `player_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_rewards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_spells`
--

DROP TABLE IF EXISTS `player_spells`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_spells` (
  `player_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  KEY `player_id` (`player_id`),
  CONSTRAINT `player_spells_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_spells`
--

LOCK TABLES `player_spells` WRITE;
/*!40000 ALTER TABLE `player_spells` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_spells` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_stash`
--

DROP TABLE IF EXISTS `player_stash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_stash` (
  `player_id` int NOT NULL,
  `item_id` int NOT NULL,
  `item_count` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_stash`
--

LOCK TABLES `player_stash` WRITE;
/*!40000 ALTER TABLE `player_stash` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_stash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_storage`
--

DROP TABLE IF EXISTS `player_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_storage` (
  `player_id` int NOT NULL DEFAULT '0',
  `key` int unsigned NOT NULL DEFAULT '0',
  `value` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`player_id`,`key`),
  CONSTRAINT `player_storage_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_storage`
--

LOCK TABLES `player_storage` WRITE;
/*!40000 ALTER TABLE `player_storage` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_taskhunt`
--

DROP TABLE IF EXISTS `player_taskhunt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_taskhunt` (
  `player_id` int NOT NULL,
  `slot` tinyint(1) NOT NULL,
  `state` tinyint(1) NOT NULL,
  `raceid` varchar(250) NOT NULL,
  `upgrade` tinyint(1) NOT NULL,
  `rarity` tinyint(1) NOT NULL,
  `kills` varchar(250) NOT NULL,
  `disabled_time` bigint NOT NULL,
  `free_reroll` bigint NOT NULL,
  `monster_list` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_taskhunt`
--

LOCK TABLES `player_taskhunt` WRITE;
/*!40000 ALTER TABLE `player_taskhunt` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_taskhunt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `group_id` int NOT NULL DEFAULT '1',
  `account_id` int unsigned NOT NULL DEFAULT '0',
  `level` int NOT NULL DEFAULT '1',
  `vocation` int NOT NULL DEFAULT '0',
  `health` int NOT NULL DEFAULT '150',
  `healthmax` int NOT NULL DEFAULT '150',
  `experience` bigint NOT NULL DEFAULT '0',
  `lookbody` int NOT NULL DEFAULT '0',
  `lookfeet` int NOT NULL DEFAULT '0',
  `lookhead` int NOT NULL DEFAULT '0',
  `looklegs` int NOT NULL DEFAULT '0',
  `looktype` int NOT NULL DEFAULT '136',
  `lookaddons` int NOT NULL DEFAULT '0',
  `maglevel` int NOT NULL DEFAULT '0',
  `mana` int NOT NULL DEFAULT '0',
  `manamax` int NOT NULL DEFAULT '0',
  `manaspent` bigint unsigned NOT NULL DEFAULT '0',
  `soul` int unsigned NOT NULL DEFAULT '0',
  `town_id` int NOT NULL DEFAULT '1',
  `posx` int NOT NULL DEFAULT '0',
  `posy` int NOT NULL DEFAULT '0',
  `posz` int NOT NULL DEFAULT '0',
  `conditions` blob NOT NULL,
  `cap` int NOT NULL DEFAULT '0',
  `sex` int NOT NULL DEFAULT '0',
  `lastlogin` bigint unsigned NOT NULL DEFAULT '0',
  `lastip` int unsigned NOT NULL DEFAULT '0',
  `save` tinyint(1) NOT NULL DEFAULT '1',
  `skull` tinyint(1) NOT NULL DEFAULT '0',
  `skulltime` bigint NOT NULL DEFAULT '0',
  `lastlogout` bigint unsigned NOT NULL DEFAULT '0',
  `blessings` tinyint NOT NULL DEFAULT '0',
  `blessings1` tinyint NOT NULL DEFAULT '0',
  `blessings2` tinyint NOT NULL DEFAULT '0',
  `blessings3` tinyint NOT NULL DEFAULT '0',
  `blessings4` tinyint NOT NULL DEFAULT '0',
  `blessings5` tinyint NOT NULL DEFAULT '0',
  `blessings6` tinyint NOT NULL DEFAULT '0',
  `blessings7` tinyint NOT NULL DEFAULT '0',
  `blessings8` tinyint NOT NULL DEFAULT '0',
  `onlinetime` int NOT NULL DEFAULT '0',
  `deletion` bigint NOT NULL DEFAULT '0',
  `balance` bigint unsigned NOT NULL DEFAULT '0',
  `offlinetraining_time` smallint unsigned NOT NULL DEFAULT '43200',
  `offlinetraining_skill` tinyint NOT NULL DEFAULT '-1',
  `stamina` smallint unsigned NOT NULL DEFAULT '2520',
  `skill_fist` int unsigned NOT NULL DEFAULT '10',
  `skill_fist_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_club` int unsigned NOT NULL DEFAULT '10',
  `skill_club_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_sword` int unsigned NOT NULL DEFAULT '10',
  `skill_sword_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_axe` int unsigned NOT NULL DEFAULT '10',
  `skill_axe_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_dist` int unsigned NOT NULL DEFAULT '10',
  `skill_dist_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_shielding` int unsigned NOT NULL DEFAULT '10',
  `skill_shielding_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_fishing` int unsigned NOT NULL DEFAULT '10',
  `skill_fishing_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_critical_hit_chance` int unsigned NOT NULL DEFAULT '0',
  `skill_critical_hit_chance_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_critical_hit_damage` int unsigned NOT NULL DEFAULT '0',
  `skill_critical_hit_damage_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_life_leech_chance` int unsigned NOT NULL DEFAULT '0',
  `skill_life_leech_chance_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_life_leech_amount` int unsigned NOT NULL DEFAULT '0',
  `skill_life_leech_amount_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_mana_leech_chance` int unsigned NOT NULL DEFAULT '0',
  `skill_mana_leech_chance_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_mana_leech_amount` int unsigned NOT NULL DEFAULT '0',
  `skill_mana_leech_amount_tries` bigint unsigned NOT NULL DEFAULT '0',
  `skill_criticalhit_chance` bigint unsigned NOT NULL DEFAULT '0',
  `skill_criticalhit_damage` bigint unsigned NOT NULL DEFAULT '0',
  `skill_lifeleech_chance` bigint unsigned NOT NULL DEFAULT '0',
  `skill_lifeleech_amount` bigint unsigned NOT NULL DEFAULT '0',
  `skill_manaleech_chance` bigint unsigned NOT NULL DEFAULT '0',
  `skill_manaleech_amount` bigint unsigned NOT NULL DEFAULT '0',
  `manashield` smallint unsigned NOT NULL DEFAULT '0',
  `max_manashield` smallint unsigned NOT NULL DEFAULT '0',
  `xpboost_stamina` smallint DEFAULT NULL,
  `xpboost_value` tinyint DEFAULT NULL,
  `marriage_status` bigint unsigned NOT NULL DEFAULT '0',
  `marriage_spouse` int NOT NULL DEFAULT '-1',
  `bonus_rerolls` bigint NOT NULL DEFAULT '0',
  `prey_wildcard` bigint NOT NULL DEFAULT '0',
  `task_points` bigint NOT NULL DEFAULT '0',
  `quickloot_fallback` tinyint(1) DEFAULT '0',
  `lookmountbody` tinyint unsigned NOT NULL DEFAULT '0',
  `lookmountfeet` tinyint unsigned NOT NULL DEFAULT '0',
  `lookmounthead` tinyint unsigned NOT NULL DEFAULT '0',
  `lookmountlegs` tinyint unsigned NOT NULL DEFAULT '0',
  `lookfamiliarstype` int unsigned NOT NULL DEFAULT '0',
  `isreward` tinyint(1) NOT NULL DEFAULT '1',
  `istutorial` tinyint(1) NOT NULL DEFAULT '0',
  `forge_dusts` bigint NOT NULL DEFAULT '0',
  `forge_dust_level` bigint NOT NULL DEFAULT '100',
  `randomize_mount` tinyint(1) NOT NULL DEFAULT '0',
  `boss_points` int NOT NULL DEFAULT '0',
  `world_id` int unsigned DEFAULT NULL,
  `hidden` tinyint(1) DEFAULT '0',
  `deletedAt` int unsigned DEFAULT '0',
  `createdAt` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_unique` (`name`),
  KEY `account_id` (`account_id`),
  KEY `vocation` (`vocation`),
  KEY `players_world_id_foreign` (`world_id`),
  CONSTRAINT `players_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `players_world_id_foreign` FOREIGN KEY (`world_id`) REFERENCES `worlds` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'Rook Sample',1,1,2,0,155,155,100,113,115,95,39,129,0,2,60,60,5936,0,1,0,0,0,'',410,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,12,155,12,155,12,155,12,93,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,0,0,1771372055),(2,'Sorcerer Sample',1,1,8,1,185,185,4200,113,115,95,39,129,0,0,90,90,0,0,8,0,0,0,'',470,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,0,0,1771372055),(3,'Druid Sample',1,1,8,2,185,185,4200,113,115,95,39,129,0,0,90,90,0,0,8,0,0,0,'',470,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,0,0,1771372055),(4,'Paladin Sample',1,1,8,3,185,185,4200,113,115,95,39,129,0,0,90,90,0,0,8,0,0,0,'',470,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,0,0,1771372055),(5,'Knight Sample',1,1,8,4,185,185,4200,113,115,95,39,129,0,0,90,90,0,0,8,0,0,0,'',470,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,0,0,1771372055),(6,'GOD',6,1,2,0,155,155,100,113,115,95,39,75,0,0,60,60,0,0,8,0,0,0,'',410,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,0,0,1771372055),(8,'Caramellow',1,2,1,0,150,150,0,0,0,0,0,136,0,0,0,0,0,0,1,0,0,0,'',0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,1,1,0,1771379533);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/  /*!50003 TRIGGER `ondelete_players` BEFORE DELETE ON `players` FOR EACH ROW BEGIN

        UPDATE `houses` SET `owner` = 0 WHERE `owner` = OLD.`id`;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `players_comment`
--

DROP TABLE IF EXISTS `players_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players_comment` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `comment` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_comment_player_id_unique` (`player_id`),
  CONSTRAINT `players_comment_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players_comment`
--

LOCK TABLES `players_comment` WRITE;
/*!40000 ALTER TABLE `players_comment` DISABLE KEYS */;
INSERT INTO `players_comment` VALUES (1,8,'Wrauff wrauuuf Auuuuuu!!!','2026-02-18 01:53:06','2026-02-18 01:53:06');
/*!40000 ALTER TABLE `players_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players_online`
--

DROP TABLE IF EXISTS `players_online`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players_online` (
  `player_id` int NOT NULL,
  PRIMARY KEY (`player_id`)
) ENGINE=MEMORY DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players_online`
--

LOCK TABLES `players_online` WRITE;
/*!40000 ALTER TABLE `players_online` DISABLE KEYS */;
/*!40000 ALTER TABLE `players_online` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players_titles`
--

DROP TABLE IF EXISTS `players_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players_titles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `in_use` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `players_titles_player_id_index` (`player_id`),
  KEY `players_titles_in_use_index` (`in_use`),
  CONSTRAINT `players_titles_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players_titles`
--

LOCK TABLES `players_titles` WRITE;
/*!40000 ALTER TABLE `players_titles` DISABLE KEYS */;
/*!40000 ALTER TABLE `players_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `server_config`
--

DROP TABLE IF EXISTS `server_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `server_config` (
  `config` varchar(50) NOT NULL,
  `value` varchar(256) NOT NULL DEFAULT '',
  PRIMARY KEY (`config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `server_config`
--

LOCK TABLES `server_config` WRITE;
/*!40000 ALTER TABLE `server_config` DISABLE KEYS */;
INSERT INTO `server_config` VALUES ('db_version','25'),('motd_hash',''),('motd_num','0'),('players_record','0');
/*!40000 ALTER TABLE `server_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_history`
--

DROP TABLE IF EXISTS `store_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `mode` smallint NOT NULL DEFAULT '0',
  `description` varchar(3500) NOT NULL,
  `coin_type` tinyint(1) NOT NULL DEFAULT '0',
  `coin_amount` int NOT NULL,
  `time` bigint unsigned NOT NULL,
  `timestamp` int NOT NULL DEFAULT '0',
  `coins` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `store_history_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_history`
--

LOCK TABLES `store_history` WRITE;
/*!40000 ALTER TABLE `store_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tile_store`
--

DROP TABLE IF EXISTS `tile_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tile_store` (
  `house_id` int NOT NULL,
  `data` longblob NOT NULL,
  KEY `house_id` (`house_id`),
  CONSTRAINT `tile_store_account_fk` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tile_store`
--

LOCK TABLES `tile_store` WRITE;
/*!40000 ALTER TABLE `tile_store` DISABLE KEYS */;
/*!40000 ALTER TABLE `tile_store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `towns`
--

DROP TABLE IF EXISTS `towns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `towns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `posx` int NOT NULL DEFAULT '0',
  `posy` int NOT NULL DEFAULT '0',
  `posz` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `towns`
--

LOCK TABLES `towns` WRITE;
/*!40000 ALTER TABLE `towns` DISABLE KEYS */;
/*!40000 ALTER TABLE `towns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vocations`
--

DROP TABLE IF EXISTS `vocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocations` (
  `vocation_id` int unsigned NOT NULL,
  `vocation_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vocation_id`),
  UNIQUE KEY `vocations_vocation_name_unique` (`vocation_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vocations`
--

LOCK TABLES `vocations` WRITE;
/*!40000 ALTER TABLE `vocations` DISABLE KEYS */;
INSERT INTO `vocations` VALUES (0,'None','No vocation','2026-02-17 23:39:34','2026-02-17 23:39:34'),(1,'Sorcerer','Master of fire and energy','2026-02-17 23:39:34','2026-02-17 23:39:34'),(2,'Druid','Master of nature and healing','2026-02-17 23:39:34','2026-02-17 23:39:34'),(3,'Paladin','Master of ranged combat and healing','2026-02-17 23:39:34','2026-02-17 23:39:34'),(4,'Knight','Master of close combat and defense','2026-02-17 23:39:34','2026-02-17 23:39:34');
/*!40000 ALTER TABLE `vocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worlds`
--

DROP TABLE IF EXISTS `worlds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worlds` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `serverName` varchar(100) NOT NULL,
  `pvptype` enum('pvp','no-pvp','pvp-enforced') NOT NULL DEFAULT 'pvp',
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `worlds_servername_unique` (`serverName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worlds`
--

LOCK TABLES `worlds` WRITE;
/*!40000 ALTER TABLE `worlds` DISABLE KEYS */;
INSERT INTO `worlds` VALUES (1,'Tibia Test World','pvp','Test Location','2026-02-17 23:59:55','2026-02-17 23:59:55');
/*!40000 ALTER TABLE `worlds` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-03 10:56:24
