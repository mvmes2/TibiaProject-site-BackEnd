-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: tibiaproject
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Current Database: `tibiaproject`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `tibiaproject` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `tibiaproject`;

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
  `password` varchar(70) NOT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `created` int NOT NULL DEFAULT '0',
  `rlname` varchar(255) NOT NULL DEFAULT '',
  `location` varchar(255) NOT NULL DEFAULT '',
  `country` varchar(3) NOT NULL DEFAULT '',
  `web_lastlogin` int NOT NULL DEFAULT '0',
  `web_flags` int NOT NULL DEFAULT '0',
  `email_hash` varchar(32) NOT NULL DEFAULT '',
  `email_new` varchar(255) NOT NULL DEFAULT '',
  `email_new_time` int NOT NULL DEFAULT '0',
  `email_code` varchar(255) NOT NULL DEFAULT '',
  `email_next` int NOT NULL DEFAULT '0',
  `premium_points` int NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `key` varchar(64) NOT NULL DEFAULT '',
  `blocked` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'internal usage',
  `premdays` int NOT NULL DEFAULT '0',
  `lastday` int unsigned NOT NULL DEFAULT '0',
  `type` tinyint unsigned NOT NULL DEFAULT '1',
  `coins` int unsigned NOT NULL DEFAULT '0',
  `tournament_coins` int unsigned NOT NULL DEFAULT '0',
  `creation` int unsigned NOT NULL DEFAULT '0',
  `recruiter` int DEFAULT '0',
  `vote` int NOT NULL DEFAULT '0',
  `createdAt` bigint NOT NULL DEFAULT '0',
  `deletedAt` bigint NOT NULL DEFAULT '0',
  `ban_duration` bigint NOT NULL DEFAULT '0',
  `isBanned` tinyint(1) NOT NULL DEFAULT '0',
  `banReason` varchar(255) DEFAULT NULL,
  `loginHash` varchar(45) DEFAULT NULL,
  `recovery_key` varchar(60) DEFAULT NULL,
  `password2` varchar(25) DEFAULT NULL,
  `change_pass_token` varchar(270) DEFAULT NULL,
  `login_token` varchar(270) DEFAULT NULL,
  `day_end_premmy` bigint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (48,'anderkrox','d78fe3cac664bfff9bcdc1d714c304ee299e4211','andersonsacani93@gmail.com',1,'','','bra',1679865192,0,'','',0,'',0,0,1,'',0,54,1684594866,5,0,0,0,0,0,1678807669,0,0,0,NULL,'Hea2fceC','JH32HF5EDAC4A2FAFBFA7GI','Rghu1500','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoiYW5kZXJzb25zYWNhbmk5M0BnbWFpbC5jb20iLCJuYW1lIjoiYW5kZXJrcm94IiwiaWQiOjQ4LCJwYXNzd29yZDIiOiJSZ2h1MTUwMCJ9LCJpYXQiOjE2NzkyNjg1OTgsImV4cCI6MTY3OTI3MDM5OH0.L9HF_mcCN5zg_KHhKGCbfwsoLqr-B3HOfB8lqu0PIX4','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk4NjUxOTIsImV4cCI6MTY3OTg2ODc5Mn0.AjaBeQpS_uiJtebCoxK-6oL0RsMfDmms57HDaZ2QmVo',1684616126),(49,'Marcus','f585ceefee3a8f641f2e3e6b3f294741b5af4ab5','mvmes23@gmail.com',1,'','','bra',1679880129,0,'','',0,'',0,0,1,'',0,28,1682089512,5,0,0,0,0,0,1678807689,0,0,0,NULL,'Aei0iA9J','J38B0FE7IC6IABGDIC0D0G3','Mvm19018009@',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk4ODAxMjksImV4cCI6MTY3OTg4MzcyOX0.-Ki9fnIUL1I1uUdQREHeH8t-ZYAM-ifvUZRBNF-qxa4',1682371604),(50,'anderkroxx','5750aec85f4bfeaa75676d9c81ff7694b6fa37ea','anderson.s93@hotmail.com',1,'','','bra',1679676623,0,'','',0,'',0,0,1,'',0,0,0,1,1395,0,0,0,0,1679163120,0,0,0,NULL,'IgEb22EH','78DFIII4BE021GB12B2EFEC','Rghu1500Tibiaproject!',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk2NzY2MjMsImV4cCI6MTY3OTY4MDIyM30.8p1Wtem9qn_UaOh1zzwVd-JHu6TTtCxRyOp7Uw-JY1U',0),(51,'SoulsTom','658daa3611f16f1a3c9878acd737457a1816a356','manthovaniusa@gmail.com',1,'','','bra',1679887653,0,'','',0,'',0,0,1,'',0,0,0,1,174,0,0,0,0,1679163148,0,0,0,NULL,'C03Ja0bE','FC1FBHDFA4A5I8G2CE7GBAJ','Mvm19018009',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk4ODc2NTMsImV4cCI6MTY3OTg5MTI1M30.X4XAY1iMyYY3cz7-phQBOJIzAqNKHLXYJnbogS0L5Ik',1679951929),(53,'garry','658daa3611f16f1a3c9878acd737457a1816a356','garryboinaverde@gmail.com',1,'','','bra',1679886971,0,'','',0,'',0,0,1,'',0,2,0,1,1422,0,0,0,0,1679595266,0,0,0,NULL,'3GgDB5gj','H37CC24F8IBHC10D8F978GA','Mvm19018009',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk4ODY5NzEsImV4cCI6MTY3OTg5MDU3MX0.j-k1hxlAY3NEikn9NdrlcHlI_yl1BfbPLwJhCl6oTbQ',1680125074),(54,'Dokho','7cd38cc3b450606fba4acfc4a0c3103f54813277','Tudoeunessacasa01@gmail.com',0,'','','bra',1679628352,0,'','',0,'',0,0,0,'',0,0,0,1,1,0,0,0,0,1679626926,0,0,0,NULL,'AiCe89B1',NULL,'@L1c317*',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk2MjgzNTIsImV4cCI6MTY3OTYzMTk1Mn0.YS862iaGnmut_p5cvBPkda6or9hTdHzXaDLuO63IFmo',0),(55,'DevTest','b799fd88a2b66231d06ccaf149ba9fcd23e8f11e','cauepani06@gmail.com',1,'','','bra',1679691291,0,'','',0,'',0,0,1,'',0,0,0,1,1,0,0,0,0,1679674816,0,0,0,NULL,'0G65j6gD','90EFEGF382A50G666D84IFA','Legend@22',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk2OTEyOTEsImV4cCI6MTY3OTY5NDg5MX0.7sElhtK6vauZdTMXGgenzKGyTlJ8c6fDHOVZICZ0Iog',0);
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
INSERT INTO `boosted_boss` VALUES (1068,79,76,114,113,3,0,'24','The Blazing Rose','1600');
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
INSERT INTO `boosted_creature` VALUES (1149,0,0,0,0,0,0,'24','Hibernal Moth','1737');
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
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
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
INSERT INTO `global_storage` VALUES ('40000','4');
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
  `description` text NOT NULL,
  `logo_name` varchar(255) NOT NULL DEFAULT 'default.gif',
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
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `oncreate_guilds` AFTER INSERT ON `guilds` FOR EACH ROW BEGIN
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
) ENGINE=InnoDB AUTO_INCREMENT=3687 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `houses`
--

LOCK TABLES `houses` WRITE;
/*!40000 ALTER TABLE `houses` DISABLE KEYS */;
INSERT INTO `houses` VALUES (2628,0,1678027273,0,'Castle of the Winds',500000,5,0,0,0,0,863,NULL,36),(2629,0,1678027273,0,'Ab\'Dendriel Clanhall',250000,5,0,0,0,0,456,NULL,20),(2630,0,1678027273,0,'Underwood 9',50000,5,0,0,0,0,29,NULL,2),(2631,0,1678027273,0,'Treetop 13',100000,5,0,0,0,0,45,NULL,4),(2632,0,1678027273,0,'Underwood 8',50000,5,0,0,0,0,33,NULL,4),(2633,0,1678027273,0,'Treetop 11',50000,5,0,0,0,0,34,NULL,4),(2635,0,1678027273,0,'Great Willow 2a',50000,5,0,0,0,0,34,NULL,2),(2637,0,1678027273,0,'Great Willow 2b',50000,5,0,0,0,0,29,NULL,2),(2638,0,1678027273,0,'Great Willow Western Wing',100000,5,0,0,0,0,90,NULL,10),(2640,0,1678027273,0,'Great Willow 1',100000,5,0,0,0,0,55,NULL,4),(2642,0,1678027273,0,'Great Willow 3a',50000,5,0,0,0,0,33,NULL,2),(2644,0,1678027273,0,'Great Willow 3b',80000,5,0,0,0,0,52,NULL,4),(2645,0,1678027273,0,'Great Willow 4a',25000,5,0,0,0,0,27,NULL,4),(2648,0,1678027273,0,'Great Willow 4b',25000,5,0,0,0,0,31,NULL,4),(2649,0,1678027273,0,'Underwood 6',100000,5,0,0,0,0,55,NULL,6),(2650,0,1678027273,0,'Underwood 3',100000,5,0,0,0,0,56,NULL,6),(2651,0,1678027273,0,'Underwood 5',80000,5,0,0,0,0,49,NULL,6),(2652,0,1678027273,0,'Underwood 2',100000,5,0,0,0,0,53,NULL,4),(2653,0,1678027273,0,'Underwood 1',100000,5,0,0,0,0,54,NULL,4),(2654,0,1678027273,0,'Prima Arbor',400000,5,0,0,0,0,316,NULL,6),(2655,0,1678027273,0,'Underwood 7',200000,5,0,0,0,0,52,NULL,4),(2656,0,1678027273,0,'Underwood 10',25000,5,0,0,0,0,30,NULL,2),(2657,0,1678027273,0,'Underwood 4',100000,5,0,0,0,0,72,NULL,8),(2658,0,1678027273,0,'Treetop 9',50000,5,0,0,0,0,35,NULL,4),(2659,0,1678027273,0,'Treetop 10',80000,5,0,0,0,0,42,NULL,4),(2660,0,1678027273,0,'Treetop 8',25000,5,0,0,0,0,35,NULL,2),(2661,0,1678027273,0,'Treetop 7',50000,5,0,0,0,0,28,NULL,2),(2662,0,1678027273,0,'Treetop 6',25000,5,0,0,0,0,24,NULL,2),(2663,0,1678027273,0,'Treetop 5 (Shop)',80000,5,0,0,0,0,54,NULL,2),(2664,0,1678027273,0,'Treetop 12 (Shop)',100000,5,0,0,0,0,56,NULL,2),(2665,0,1678027273,0,'Treetop 4 (Shop)',80000,5,0,0,0,0,48,NULL,2),(2666,0,1678027273,0,'Treetop 3 (Shop)',80000,5,0,0,0,0,60,NULL,2),(2687,0,1678027273,0,'Northern Street 1a',100000,6,0,0,0,0,42,NULL,4),(2688,0,1678027273,0,'Park Lane 3a',100000,6,0,0,0,0,48,NULL,4),(2689,0,1678027273,0,'Park Lane 1a',150000,6,0,0,0,0,53,NULL,4),(2690,0,1678027273,0,'Park Lane 4',150000,6,0,0,0,0,42,NULL,4),(2691,0,1678027273,0,'Park Lane 2',150000,6,0,0,0,0,42,NULL,4),(2692,0,1678027273,0,'Theater Avenue 7, Flat 04',50000,6,0,0,0,0,20,NULL,2),(2693,0,1678027273,0,'Theater Avenue 7, Flat 03',25000,6,0,0,0,0,19,NULL,2),(2694,0,1678027273,0,'Theater Avenue 7, Flat 05',50000,6,0,0,0,0,20,NULL,2),(2695,0,1678027273,0,'Theater Avenue 7, Flat 06',25000,6,0,0,0,0,20,NULL,2),(2696,0,1678027273,0,'Theater Avenue 7, Flat 02',25000,6,0,0,0,0,20,NULL,2),(2697,0,1678027273,0,'Theater Avenue 7, Flat 01',25000,6,0,0,0,0,20,NULL,2),(2698,0,1678027273,0,'Northern Street 5',200000,6,0,0,0,0,68,NULL,4),(2699,0,1678027273,0,'Northern Street 7',150000,6,0,0,0,0,59,NULL,4),(2700,0,1678027273,0,'Theater Avenue 6e',80000,6,0,0,0,0,31,NULL,4),(2701,0,1678027273,0,'Theater Avenue 6c',25000,6,0,0,0,0,12,NULL,2),(2702,0,1678027273,0,'Theater Avenue 6a',80000,6,0,0,0,0,35,NULL,4),(2703,0,1678027273,0,'Theater Avenue, Tower',300000,6,0,0,0,0,125,NULL,0),(2705,0,1678027273,0,'East Lane 2',300000,6,0,0,0,0,111,NULL,4),(2706,0,1678027273,0,'Harbour Lane 2a (Shop)',80000,6,0,0,0,0,32,NULL,0),(2707,0,1678027273,0,'Harbour Lane 2b (Shop)',80000,6,0,0,0,0,40,NULL,0),(2708,0,1678027273,0,'Harbour Lane 3',400000,6,0,0,0,0,113,NULL,6),(2709,0,1678027273,0,'Magician\'s Alley 8',150000,6,0,0,0,0,49,NULL,4),(2710,0,1678027273,0,'Lonely Sea Side Hostel',400000,6,0,0,0,0,397,NULL,16),(2711,0,1678027273,0,'Suntower',500000,6,0,0,0,0,450,NULL,14),(2712,0,1678027273,0,'House of Recreation',500000,6,0,0,0,0,687,NULL,32),(2713,0,1678027273,0,'Carlin Clanhall',250000,6,0,0,0,0,374,NULL,20),(2714,0,1678027273,0,'Magician\'s Alley 4',200000,6,0,0,0,0,96,NULL,8),(2715,0,1678027273,0,'Theater Avenue 14 (Shop)',200000,6,0,0,0,0,83,NULL,2),(2716,0,1678027273,0,'Theater Avenue 12',80000,6,0,0,0,0,28,NULL,4),(2717,0,1678027273,0,'Magician\'s Alley 1',100000,6,0,0,0,0,35,NULL,4),(2718,0,1678027273,0,'Theater Avenue 10',100000,6,0,0,0,0,45,NULL,4),(2719,0,1678027273,0,'Magician\'s Alley 1b',25000,6,0,0,0,0,24,NULL,4),(2720,0,1678027273,0,'Magician\'s Alley 1a',25000,6,0,0,0,0,28,NULL,4),(2721,0,1678027273,0,'Magician\'s Alley 1c',25000,6,0,0,0,0,20,NULL,2),(2722,0,1678027273,0,'Magician\'s Alley 1d',25000,6,0,0,0,0,24,NULL,2),(2723,0,1678027273,0,'Magician\'s Alley 5c',100000,6,0,0,0,0,35,NULL,4),(2724,0,1678027273,0,'Magician\'s Alley 5f',80000,6,0,0,0,0,42,NULL,4),(2725,0,1678027273,0,'Magician\'s Alley 5b',50000,6,0,0,0,0,40,NULL,4),(2727,0,1678027273,0,'Magician\'s Alley 5a',50000,6,0,0,0,0,45,NULL,4),(2729,0,1678027273,0,'Central Plaza 3 (Shop)',50000,6,0,0,0,0,24,NULL,0),(2730,0,1681181728,0,'Central Plaza 2 (Shop)',25000,6,0,0,0,0,24,NULL,0),(2731,0,1678027273,0,'Central Plaza 1 (Shop)',50000,6,0,0,0,0,24,NULL,0),(2732,0,1678027273,0,'Theater Avenue 8b',100000,6,0,0,0,0,49,NULL,4),(2733,0,1678027273,0,'Harbour Lane 1 (Shop)',100000,6,0,0,0,0,54,NULL,0),(2734,0,1678027273,0,'Theater Avenue 6f',80000,6,0,0,0,0,31,NULL,4),(2735,0,1678027273,0,'Theater Avenue 6d',25000,6,0,0,0,0,12,NULL,2),(2736,0,1678027273,0,'Theater Avenue 6b',50000,6,0,0,0,0,35,NULL,4),(2737,0,1678027273,0,'Northern Street 3a',80000,6,0,0,0,0,34,NULL,4),(2738,0,1678027273,0,'Northern Street 3b',80000,6,0,0,0,0,36,NULL,4),(2739,0,1678027273,0,'Northern Street 1b',80000,6,0,0,0,0,37,NULL,4),(2740,0,1678027273,0,'Northern Street 1c',80000,6,0,0,0,0,35,NULL,4),(2741,0,1678027273,0,'Theater Avenue 7, Flat 14',25000,6,0,0,0,0,20,NULL,2),(2742,0,1678027273,0,'Theater Avenue 7, Flat 13',25000,6,0,0,0,0,20,NULL,2),(2743,0,1678027273,0,'Theater Avenue 7, Flat 15',25000,6,0,0,0,0,20,NULL,2),(2744,0,1678027273,0,'Theater Avenue 7, Flat 12',25000,6,0,0,0,0,20,NULL,2),(2745,0,1678027273,0,'Theater Avenue 7, Flat 11',50000,6,0,0,0,0,24,NULL,2),(2746,0,1678027273,0,'Theater Avenue 7, Flat 16',25000,6,0,0,0,0,24,NULL,2),(2747,0,1678027273,0,'Theater Avenue 5',200000,6,0,0,0,0,165,NULL,6),(2751,0,1678027273,0,'Harbour Flats, Flat 11',25000,6,0,0,0,0,24,NULL,2),(2752,0,1678027273,0,'Harbour Flats, Flat 13',25000,6,0,0,0,0,24,NULL,2),(2753,0,1678027273,0,'Harbour Flats, Flat 15',50000,6,0,0,0,0,38,NULL,4),(2755,0,1678027273,0,'Harbour Flats, Flat 12',50000,6,0,0,0,0,40,NULL,4),(2757,0,1678027273,0,'Harbour Flats, Flat 16',50000,6,0,0,0,0,45,NULL,4),(2759,0,1678027273,0,'Harbour Flats, Flat 21',50000,6,0,0,0,0,35,NULL,4),(2760,0,1678027273,0,'Harbour Flats, Flat 22',80000,6,0,0,0,0,45,NULL,4),(2761,0,1678027273,0,'Harbour Flats, Flat 23',25000,6,0,0,0,0,25,NULL,2),(2763,0,1678027273,0,'Park Lane 1b',200000,6,0,0,0,0,54,NULL,4),(2764,0,1678027273,0,'Theater Avenue 8a',100000,6,0,0,0,0,49,NULL,6),(2765,0,1678027273,0,'Theater Avenue 11a',100000,6,0,0,0,0,48,NULL,4),(2767,0,1678027273,0,'Theater Avenue 11b',100000,6,0,0,0,0,54,NULL,4),(2768,0,1678027273,0,'Caretaker\'s Residence',600000,6,0,0,0,0,423,NULL,0),(2769,0,1678027273,0,'Moonkeep',250000,6,0,0,0,0,518,NULL,32),(2770,0,1678027273,0,'Mangrove 1',80000,5,0,0,0,0,56,NULL,6),(2771,0,1678027273,0,'Coastwood 2',50000,5,0,0,0,0,28,NULL,4),(2772,0,1678027273,0,'Coastwood 1',50000,5,0,0,0,0,35,NULL,4),(2773,0,1678027273,0,'Coastwood 3',50000,5,0,0,0,0,37,NULL,4),(2774,0,1678027273,0,'Coastwood 4',50000,5,0,0,0,0,42,NULL,4),(2775,0,1678027273,0,'Mangrove 4',50000,5,0,0,0,0,36,NULL,4),(2776,0,1678027273,0,'Coastwood 10',80000,5,0,0,0,0,49,NULL,6),(2777,0,1678027273,0,'Coastwood 5',50000,5,0,0,0,0,49,NULL,4),(2778,0,1678027273,0,'Coastwood 6 (Shop)',80000,5,0,0,0,0,48,NULL,2),(2779,0,1678027273,0,'Coastwood 7',25000,5,0,0,0,0,29,NULL,2),(2780,0,1678027273,0,'Coastwood 8',50000,5,0,0,0,0,42,NULL,4),(2781,0,1678027273,0,'Coastwood 9',50000,5,0,0,0,0,36,NULL,2),(2782,0,1678027273,0,'Treetop 2',25000,5,0,0,0,0,24,NULL,2),(2783,0,1678027273,0,'Treetop 1',25000,5,0,0,0,0,30,NULL,2),(2784,0,1678027273,0,'Mangrove 3',80000,5,0,0,0,0,42,NULL,4),(2785,0,1678027273,0,'Mangrove 2',50000,5,0,0,0,0,48,NULL,4),(2786,0,1678027273,0,'The Hideout',250000,5,0,0,0,0,610,NULL,40),(2787,0,1678027273,0,'Shadow Towers',250000,5,0,0,0,0,708,NULL,36),(2788,0,1678027273,0,'Druids Retreat A',50000,6,0,0,0,0,60,NULL,4),(2789,0,1678027273,0,'Druids Retreat C',50000,6,0,0,0,0,45,NULL,4),(2790,0,1678027273,0,'Druids Retreat B',50000,6,0,0,0,0,56,NULL,4),(2791,0,1678027273,0,'Druids Retreat D',80000,6,0,0,0,0,51,NULL,4),(2792,0,1678027273,0,'East Lane 1b',150000,6,0,0,0,0,53,NULL,4),(2793,0,1678027273,0,'East Lane 1a',200000,6,0,0,0,0,87,NULL,4),(2794,0,1678027273,0,'Senja Village 11',80000,6,0,0,0,0,92,NULL,4),(2795,0,1678027273,0,'Senja Village 10',50000,6,0,0,0,0,72,NULL,2),(2796,0,1678027273,0,'Senja Village 9',80000,6,0,0,0,0,112,NULL,4),(2797,0,1678027273,0,'Senja Village 8',50000,6,0,0,0,0,72,NULL,4),(2798,0,1678027273,0,'Senja Village 7',25000,6,0,0,0,0,36,NULL,4),(2799,0,1678027273,0,'Senja Village 6b',25000,6,0,0,0,0,30,NULL,2),(2800,0,1678027273,0,'Senja Village 6a',50000,6,0,0,0,0,30,NULL,2),(2801,0,1678027273,0,'Senja Village 5',50000,6,0,0,0,0,48,NULL,4),(2802,0,1678027273,0,'Senja Village 4',50000,6,0,0,0,0,66,NULL,4),(2803,0,1678027273,0,'Senja Village 3',50000,6,0,0,0,0,72,NULL,4),(2804,0,1678027273,0,'Senja Village 1b',50000,6,0,0,0,0,66,NULL,4),(2805,0,1678027273,0,'Senja Village 1a',25000,6,0,0,0,0,36,NULL,2),(2806,0,1678027273,0,'Rosebud C',100000,6,0,0,0,0,70,NULL,0),(2807,0,1678027273,0,'Rosebud B',80000,6,0,0,0,0,60,NULL,2),(2808,0,1678027273,0,'Rosebud A',50000,6,0,0,0,0,60,NULL,2),(2809,0,1678027273,0,'Park Lane 3b',100000,6,0,0,0,0,48,NULL,4),(2810,0,1678027273,0,'Northport Village 6',80000,6,0,0,0,0,64,NULL,4),(2811,0,1678027273,0,'Northport Village 5',80000,6,0,0,0,0,56,NULL,4),(2812,0,1678027273,0,'Northport Village 4',100000,6,0,0,0,0,92,NULL,4),(2813,0,1678027273,0,'Northport Village 3',150000,6,0,0,0,0,119,NULL,4),(2814,0,1678027273,0,'Northport Village 2',50000,6,0,0,0,0,40,NULL,4),(2815,0,1678027273,0,'Northport Village 1',50000,6,0,0,0,0,48,NULL,4),(2816,0,1678027273,0,'Nautic Observer',200000,6,0,0,0,0,226,NULL,8),(2817,0,1678027273,0,'Nordic Stronghold',250000,6,0,0,0,0,809,NULL,42),(2818,0,1678027273,0,'Senja Clanhall',250000,6,0,0,0,0,395,NULL,18),(2819,0,1678027273,0,'Seawatch',250000,6,0,0,0,0,748,NULL,38),(2820,0,1678027273,0,'Dwarven Magnate\'s Estate',300000,7,0,0,0,0,395,NULL,0),(2821,0,1678027273,0,'Forge Master\'s Quarters',300000,7,0,0,0,0,117,NULL,0),(2822,0,1678027273,0,'Upper Barracks 13',25000,7,0,0,0,0,24,NULL,4),(2823,0,1678027273,0,'Upper Barracks 5',80000,7,0,0,0,0,50,NULL,6),(2824,0,1678027273,0,'Upper Barracks 3',80000,7,0,0,0,0,24,NULL,4),(2825,0,1678027273,0,'Upper Barracks 4',50000,7,0,0,0,0,35,NULL,4),(2826,0,1678027273,0,'Upper Barracks 2',80000,7,0,0,0,0,50,NULL,6),(2827,0,1678027273,0,'Upper Barracks 1',50000,7,0,0,0,0,35,NULL,4),(2828,0,1678027273,0,'Tunnel Gardens 9',150000,7,0,0,0,0,145,NULL,14),(2829,0,1678027273,0,'Tunnel Gardens 8',25000,7,0,0,0,0,42,NULL,4),(2830,0,1678027273,0,'Tunnel Gardens 7',50000,7,0,0,0,0,35,NULL,4),(2831,0,1678027273,0,'Tunnel Gardens 6',25000,7,0,0,0,0,42,NULL,4),(2832,0,1678027273,0,'Tunnel Gardens 5',25000,7,0,0,0,0,35,NULL,4),(2835,0,1678027273,0,'Tunnel Gardens 4',80000,7,0,0,0,0,58,NULL,6),(2836,0,1678027273,0,'Tunnel Gardens 2',80000,7,0,0,0,0,54,NULL,6),(2837,0,1678027273,0,'Tunnel Gardens 1',80000,7,0,0,0,0,47,NULL,6),(2838,0,1678027273,0,'Tunnel Gardens 3',80000,7,0,0,0,0,65,NULL,6),(2839,0,1678027273,0,'The Market 4 (Shop)',80000,7,0,0,0,0,63,NULL,2),(2840,0,1678027273,0,'The Market 3 (Shop)',80000,7,0,0,0,0,54,NULL,2),(2841,0,1678027273,0,'The Market 2 (Shop)',50000,7,0,0,0,0,45,NULL,2),(2842,0,1678027273,0,'The Market 1 (Shop)',25000,7,0,0,0,0,25,NULL,2),(2843,0,1678027273,0,'The Farms 6, Fishing Hut',50000,7,0,0,0,0,42,NULL,4),(2844,0,1678027273,0,'The Farms 5',50000,7,0,0,0,0,49,NULL,4),(2845,0,1678027273,0,'The Farms 4',25000,7,0,0,0,0,49,NULL,4),(2846,0,1678027273,0,'The Farms 3',80000,7,0,0,0,0,49,NULL,4),(2847,0,1678027273,0,'The Farms 2',50000,7,0,0,0,0,49,NULL,4),(2849,0,1678027273,0,'The Farms 1',80000,7,0,0,0,0,78,NULL,6),(2850,0,1678027273,0,'Outlaw Camp 14 (Shop)',25000,7,0,0,0,0,35,NULL,0),(2852,0,1678027273,0,'Outlaw Camp 13 (Shop)',50000,7,0,0,0,0,40,NULL,0),(2853,0,1678027273,0,'Outlaw Camp 9',80000,7,0,0,0,0,40,NULL,4),(2854,0,1678027273,0,'Outlaw Camp 7',25000,7,0,0,0,0,38,NULL,4),(2855,0,1678027273,0,'Outlaw Camp 4',50000,7,0,0,0,0,40,NULL,2),(2856,0,1678027273,0,'Outlaw Camp 2',50000,7,0,0,0,0,40,NULL,2),(2857,0,1678027273,0,'Outlaw Camp 3',50000,7,0,0,0,0,35,NULL,4),(2858,0,1678027273,0,'Outlaw Camp 1',80000,7,0,0,0,0,54,NULL,4),(2859,0,1678027273,0,'Nobility Quarter 5',100000,7,0,0,0,0,143,NULL,8),(2860,0,1678027273,0,'Nobility Quarter 4',50000,7,0,0,0,0,66,NULL,4),(2861,0,1678027273,0,'Nobility Quarter 3',80000,7,0,0,0,0,56,NULL,6),(2862,0,1678027273,0,'Nobility Quarter 2',50000,7,0,0,0,0,61,NULL,6),(2863,0,1678027273,0,'Nobility Quarter 1',80000,7,0,0,0,0,64,NULL,6),(2864,0,1678027273,0,'Lower Barracks 10',80000,7,0,0,0,0,50,NULL,4),(2865,0,1678027273,0,'Lower Barracks 9',80000,7,0,0,0,0,50,NULL,4),(2866,0,1678027273,0,'Lower Barracks 8',80000,7,0,0,0,0,50,NULL,4),(2867,0,1678027273,0,'Lower Barracks 1',80000,7,0,0,0,0,50,NULL,4),(2868,0,1678027273,0,'Lower Barracks 2',80000,7,0,0,0,0,50,NULL,4),(2869,0,1678027273,0,'Lower Barracks 3',80000,7,0,0,0,0,50,NULL,4),(2870,0,1678027273,0,'Lower Barracks 4',50000,7,0,0,0,0,50,NULL,2),(2871,0,1678027273,0,'Lower Barracks 5',100000,7,0,0,0,0,100,NULL,2),(2872,0,1678027273,0,'Lower Barracks 6',100000,7,0,0,0,0,100,NULL,4),(2873,0,1678027273,0,'Lower Barracks 7',80000,7,0,0,0,0,50,NULL,2),(2874,0,1678027273,0,'Wolftower',500000,7,0,0,0,0,679,NULL,46),(2875,0,1678027273,0,'Riverspring',250000,7,0,0,0,0,632,NULL,36),(2876,0,1678027273,0,'Outlaw Castle',250000,7,0,0,0,0,356,NULL,18),(2877,0,1678027273,0,'Marble Guildhall',250000,7,0,0,0,0,611,NULL,32),(2878,0,1678027273,0,'Iron Guildhall',250000,7,0,0,0,0,534,NULL,34),(2879,0,1678027273,0,'Hill Hideout',250000,7,0,0,0,0,391,NULL,30),(2880,0,1678027273,0,'Granite Guildhall',250000,7,0,0,0,0,627,NULL,34),(2881,0,1678027273,0,'Alai Flats, Flat 01',50000,8,0,0,0,0,25,NULL,2),(2882,0,1678027273,0,'Alai Flats, Flat 02',50000,8,0,0,0,0,35,NULL,2),(2883,0,1678027273,0,'Alai Flats, Flat 03',50000,8,0,0,0,0,36,NULL,2),(2884,0,1678027273,0,'Alai Flats, Flat 04',80000,8,0,0,0,0,30,NULL,2),(2885,0,1678027273,0,'Alai Flats, Flat 05',100000,8,0,0,0,0,42,NULL,4),(2886,0,1678027273,0,'Alai Flats, Flat 06',100000,8,0,0,0,0,42,NULL,4),(2887,0,1678027273,0,'Alai Flats, Flat 07',25000,8,0,0,0,0,30,NULL,2),(2888,0,1678027273,0,'Alai Flats, Flat 08',50000,8,0,0,0,0,36,NULL,2),(2889,0,1678027273,0,'Alai Flats, Flat 11',80000,8,0,0,0,0,30,NULL,2),(2890,0,1678027273,0,'Alai Flats, Flat 12',25000,8,0,0,0,0,30,NULL,2),(2891,0,1678027273,0,'Alai Flats, Flat 13',50000,8,0,0,0,0,36,NULL,2),(2892,0,1678027273,0,'Alai Flats, Flat 14',80000,8,0,0,0,0,32,NULL,2),(2893,0,1678027273,0,'Alai Flats, Flat 15',100000,8,0,0,0,0,46,NULL,4),(2894,0,1678027273,0,'Alai Flats, Flat 16',100000,8,0,0,0,0,46,NULL,4),(2895,0,1678027273,0,'Alai Flats, Flat 17',80000,8,0,0,0,0,32,NULL,2),(2896,0,1678027273,0,'Alai Flats, Flat 18',50000,8,0,0,0,0,38,NULL,2),(2897,0,1678027273,0,'Alai Flats, Flat 21',50000,8,0,0,0,0,30,NULL,2),(2898,0,1678027273,0,'Alai Flats, Flat 22',50000,8,0,0,0,0,30,NULL,2),(2899,0,1678027273,0,'Alai Flats, Flat 23',25000,8,0,0,0,0,36,NULL,2),(2900,0,1678027273,0,'Alai Flats, Flat 28',80000,8,0,0,0,0,32,NULL,2),(2901,0,1678027273,0,'Alai Flats, Flat 27',80000,8,0,0,0,0,32,NULL,2),(2902,0,1678027273,0,'Alai Flats, Flat 26',100000,8,0,0,0,0,46,NULL,4),(2903,0,1678027273,0,'Alai Flats, Flat 25',100000,8,0,0,0,0,46,NULL,4),(2904,0,1678027273,0,'Alai Flats, Flat 24',80000,8,0,0,0,0,39,NULL,2),(2905,0,1678027273,0,'Beach Home Apartments, Flat 01',50000,8,0,0,0,0,25,NULL,2),(2906,0,1678027273,0,'Beach Home Apartments, Flat 02',80000,8,0,0,0,0,30,NULL,2),(2907,0,1678027273,0,'Beach Home Apartments, Flat 03',80000,8,0,0,0,0,24,NULL,2),(2908,0,1678027273,0,'Beach Home Apartments, Flat 04',50000,8,0,0,0,0,24,NULL,2),(2909,0,1678027273,0,'Beach Home Apartments, Flat 05',80000,8,0,0,0,0,30,NULL,2),(2910,0,1678027273,0,'Beach Home Apartments, Flat 06',100000,8,0,0,0,0,40,NULL,4),(2911,0,1678027273,0,'Beach Home Apartments, Flat 11',25000,8,0,0,0,0,25,NULL,2),(2912,0,1678027273,0,'Beach Home Apartments, Flat 12',50000,8,0,0,0,0,30,NULL,2),(2913,0,1678027273,0,'Beach Home Apartments, Flat 13',80000,8,0,0,0,0,30,NULL,2),(2914,0,1678027273,0,'Beach Home Apartments, Flat 14',25000,8,0,0,0,0,15,NULL,2),(2915,0,1678027273,0,'Beach Home Apartments, Flat 15',25000,8,0,0,0,0,20,NULL,2),(2916,0,1678027273,0,'Beach Home Apartments, Flat 16',80000,8,0,0,0,0,40,NULL,4),(2917,0,1678027273,0,'Demon Tower',100000,8,0,0,0,0,177,NULL,4),(2918,0,1678027273,0,'Farm Lane, 1st floor (Shop)',80000,8,0,0,0,0,36,NULL,0),(2919,0,1678027273,0,'Farm Lane, 2nd Floor (Shop)',50000,8,0,0,0,0,36,NULL,0),(2920,0,1678027273,0,'Farm Lane, Basement (Shop)',50000,8,0,0,0,0,42,NULL,0),(2921,0,1678027273,0,'Fibula Village 1',25000,8,0,0,0,0,30,NULL,2),(2922,0,1678027273,0,'Fibula Village 2',25000,8,0,0,0,0,30,NULL,2),(2923,0,1678027273,0,'Fibula Village 4',25000,8,0,0,0,0,42,NULL,4),(2924,0,1678027273,0,'Fibula Village 5',50000,8,0,0,0,0,49,NULL,4),(2925,0,1678027273,0,'Fibula Village 3',80000,8,0,0,0,0,110,NULL,8),(2926,0,1678027273,0,'Fibula Village, Tower Flat',100000,8,0,0,0,0,156,NULL,4),(2927,0,1678027273,0,'Guildhall of the Red Rose',250000,8,0,0,0,0,596,NULL,30),(2928,0,1678027273,0,'Fibula Village, Bar (Shop)',100000,8,0,0,0,0,127,NULL,4),(2929,0,1678027273,0,'Fibula Village, Villa',200000,8,0,0,0,0,397,NULL,10),(2930,0,1678027273,0,'Greenshore Village 1',80000,8,0,0,0,0,64,NULL,6),(2931,0,1678027273,0,'Greenshore Clanhall',250000,8,0,0,0,0,311,NULL,20),(2932,0,1678027273,0,'Castle of Greenshore',250000,8,0,0,0,0,474,NULL,24),(2933,0,1678027273,0,'Greenshore Village, Shop',80000,8,0,0,0,0,64,NULL,2),(2934,0,1678027273,0,'Greenshore Village, Villa',300000,8,0,0,0,0,262,NULL,8),(2935,0,1678027273,0,'Greenshore Village 7',25000,8,0,0,0,0,42,NULL,2),(2936,0,1678027273,0,'Greenshore Village 3',50000,8,0,0,0,0,55,NULL,4),(2939,0,1678027273,0,'Greenshore Village 2',50000,8,0,0,0,0,55,NULL,4),(2940,0,1678027273,0,'Greenshore Village 6',150000,8,0,0,0,0,112,NULL,4),(2941,0,1678027273,0,'Harbour Place 1 (Shop)',800000,8,0,0,0,0,48,NULL,2),(2942,0,1678027273,0,'Harbour Place 2 (Shop)',600000,8,0,0,0,0,54,NULL,2),(2943,0,1678027273,0,'Harbour Place 3',800000,8,0,0,0,0,138,NULL,0),(2944,0,1678027273,0,'Harbour Place 4',80000,8,0,0,0,0,36,NULL,2),(2945,0,1678027273,0,'Lower Swamp Lane 1',400000,8,0,0,0,0,156,NULL,8),(2946,0,1678027273,0,'Lower Swamp Lane 3',400000,8,0,0,0,0,156,NULL,8),(2947,0,1678027273,0,'Main Street 9, 1st floor (Shop)',200000,8,0,0,0,0,63,NULL,0),(2948,0,1678027273,0,'Main Street 9a, 2nd floor (Shop)',100000,8,0,0,0,0,30,NULL,0),(2949,0,1678027273,0,'Main Street 9b, 2nd floor (Shop)',150000,8,0,0,0,0,57,NULL,0),(2950,0,1678027273,0,'Mill Avenue 1 (Shop)',200000,8,0,0,0,0,54,NULL,2),(2951,0,1678027273,0,'Mill Avenue 2 (Shop)',200000,8,0,0,0,0,100,NULL,4),(2952,0,1678027273,0,'Mill Avenue 3',100000,8,0,0,0,0,49,NULL,4),(2953,0,1678027273,0,'Mill Avenue 4',100000,8,0,0,0,0,49,NULL,4),(2954,0,1678027273,0,'Mill Avenue 5',300000,8,0,0,0,0,116,NULL,8),(2955,0,1678027273,0,'Open-Air Theatre',150000,8,0,0,0,0,111,NULL,2),(2956,0,1678027273,0,'Smuggler\'s Den',400000,8,0,0,0,0,298,NULL,0),(2957,0,1678027273,0,'Sorcerer\'s Avenue 1a',100000,8,0,0,0,0,42,NULL,4),(2958,0,1678027273,0,'Sorcerer\'s Avenue 5 (Shop)',150000,8,0,0,0,0,96,NULL,2),(2959,0,1678027273,0,'Sorcerer\'s Avenue 1b',80000,8,0,0,0,0,30,NULL,4),(2960,0,1678027273,0,'Sorcerer\'s Avenue 1c',100000,8,0,0,0,0,42,NULL,4),(2961,0,1678027273,0,'Sorcerer\'s Avenue Labs 2a',50000,8,0,0,0,0,54,NULL,4),(2962,0,1678027273,0,'Sorcerer\'s Avenue Labs 2c',50000,8,0,0,0,0,48,NULL,4),(2963,0,1678027273,0,'Sorcerer\'s Avenue Labs 2b',50000,8,0,0,0,0,54,NULL,4),(2964,0,1678027273,0,'Sunset Homes, Flat 01',100000,8,0,0,0,0,25,NULL,2),(2965,0,1678027273,0,'Sunset Homes, Flat 02',80000,8,0,0,0,0,30,NULL,2),(2966,0,1678027273,0,'Sunset Homes, Flat 03',80000,8,0,0,0,0,30,NULL,2),(2967,0,1678027273,0,'Sunset Homes, Flat 11',80000,8,0,0,0,0,25,NULL,2),(2968,0,1678027273,0,'Sunset Homes, Flat 12',50000,8,0,0,0,0,26,NULL,2),(2969,0,1678027273,0,'Sunset Homes, Flat 13',100000,8,0,0,0,0,35,NULL,4),(2970,0,1678027273,0,'Sunset Homes, Flat 14',50000,8,0,0,0,0,30,NULL,2),(2971,0,1678027273,0,'Sunset Homes, Flat 21',50000,8,0,0,0,0,25,NULL,2),(2972,0,1678027273,0,'Sunset Homes, Flat 22',50000,8,0,0,0,0,26,NULL,2),(2973,0,1678027273,0,'Sunset Homes, Flat 23',80000,8,0,0,0,0,35,NULL,4),(2974,0,1678027273,0,'Sunset Homes, Flat 24',50000,8,0,0,0,0,30,NULL,2),(2975,0,1678027273,0,'Thais Hostel',200000,8,0,0,0,0,171,NULL,48),(2976,0,1678027273,0,'The City Wall 1a',150000,8,0,0,0,0,49,NULL,4),(2977,0,1678027273,0,'The City Wall 1b',100000,8,0,0,0,0,49,NULL,4),(2978,0,1678027273,0,'The City Wall 3a',100000,8,0,0,0,0,35,NULL,4),(2979,0,1678027273,0,'The City Wall 3b',100000,8,0,0,0,0,35,NULL,4),(2980,0,1678027273,0,'The City Wall 3c',100000,8,0,0,0,0,42,NULL,4),(2981,0,1678027273,0,'The City Wall 3d',100000,8,0,0,0,0,35,NULL,4),(2982,0,1678027273,0,'The City Wall 3e',100000,8,0,0,0,0,35,NULL,4),(2983,0,1678027273,0,'The City Wall 3f',100000,8,0,0,0,0,42,NULL,4),(2984,0,1678027273,0,'Upper Swamp Lane 12',300000,8,0,0,0,0,124,NULL,6),(2985,0,1678027273,0,'Upper Swamp Lane 10',150000,8,0,0,0,0,70,NULL,6),(2986,0,1678027273,0,'Upper Swamp Lane 8',600000,8,0,0,0,0,206,NULL,6),(2987,0,1678027273,0,'Upper Swamp Lane 4',600000,8,0,0,0,0,176,NULL,8),(2988,0,1678027273,0,'Upper Swamp Lane 2',600000,8,0,0,0,0,176,NULL,8),(2989,0,1678027273,0,'The City Wall 9',80000,8,0,0,0,0,50,NULL,4),(2990,0,1678027273,0,'The City Wall 7h',50000,8,0,0,0,0,30,NULL,2),(2991,0,1678027273,0,'The City Wall 7b',25000,8,0,0,0,0,30,NULL,2),(2992,0,1678027273,0,'The City Wall 7d',50000,8,0,0,0,0,36,NULL,4),(2993,0,1678027273,0,'The City Wall 7f',80000,8,0,0,0,0,36,NULL,4),(2994,0,1678027273,0,'The City Wall 7c',80000,8,0,0,0,0,36,NULL,4),(2995,0,1678027273,0,'The City Wall 7a',80000,8,0,0,0,0,30,NULL,2),(2996,0,1678027273,0,'The City Wall 7g',50000,8,0,0,0,0,30,NULL,2),(2997,0,1678027273,0,'The City Wall 7e',80000,8,0,0,0,0,36,NULL,4),(2998,0,1678027273,0,'The City Wall 5b',50000,8,0,0,0,0,24,NULL,2),(2999,0,1678027273,0,'The City Wall 5d',50000,8,0,0,0,0,24,NULL,2),(3000,0,1678027273,0,'The City Wall 5f',25000,8,0,0,0,0,30,NULL,2),(3001,0,1678027273,0,'The City Wall 5a',50000,8,0,0,0,0,24,NULL,2),(3002,0,1678027273,0,'The City Wall 5c',50000,8,0,0,0,0,24,NULL,2),(3003,0,1678027273,0,'The City Wall 5e',50000,8,0,0,0,0,30,NULL,2),(3004,0,1678027273,0,'Warriors\' Guildhall',5000000,8,0,0,0,0,539,NULL,22),(3005,0,1678027273,0,'The Tibianic',500000,8,0,0,0,0,824,NULL,44),(3006,0,1678027273,0,'Bloodhall',500000,8,0,0,0,0,538,NULL,32),(3007,0,1678027273,0,'Fibula Clanhall',250000,8,0,0,0,0,305,NULL,20),(3008,0,1678027273,0,'Dark Mansion',1000000,8,0,0,0,0,589,NULL,34),(3009,0,1678027273,0,'Halls of the Adventurers',250000,8,0,0,0,0,511,NULL,36),(3010,0,1678027273,0,'Mercenary Tower',250000,8,0,0,0,0,982,NULL,52),(3011,0,1678027273,0,'Snake Tower',500000,8,0,0,0,0,1040,NULL,42),(3012,0,1678027273,0,'Southern Thais Guildhall',1000000,8,0,0,0,0,634,NULL,32),(3013,0,1678027273,0,'Spiritkeep',500000,8,0,0,0,0,562,NULL,26),(3014,0,1678027273,0,'Thais Clanhall',500000,8,0,0,0,0,380,NULL,20),(3015,0,1678027273,0,'The Lair',200000,9,0,0,0,0,335,NULL,6),(3016,0,1678027273,0,'Silver Street 4',300000,9,0,0,0,0,153,NULL,4),(3017,0,1678027273,0,'Dream Street 1 (Shop)',600000,9,0,0,0,0,178,NULL,4),(3018,0,1678027273,0,'Dagger Alley 1',200000,9,0,0,0,0,126,NULL,4),(3019,0,1678027273,0,'Dream Street 2',400000,9,0,0,0,0,138,NULL,4),(3020,0,1678027273,0,'Dream Street 3',300000,9,0,0,0,0,126,NULL,4),(3021,0,1678027273,0,'Elm Street 1',300000,9,0,0,0,0,114,NULL,4),(3022,0,1678027273,0,'Elm Street 3',300000,9,0,0,0,0,120,NULL,6),(3023,0,1678027273,0,'Elm Street 2',300000,9,0,0,0,0,120,NULL,4),(3024,0,1678027273,0,'Elm Street 4',300000,9,0,0,0,0,126,NULL,4),(3025,0,1678027273,0,'Seagull Walk 1',800000,9,0,0,0,0,202,NULL,4),(3026,0,1678027273,0,'Seagull Walk 2',300000,9,0,0,0,0,132,NULL,6),(3027,0,1678027273,0,'Dream Street 4',400000,9,0,0,0,0,168,NULL,8),(3028,0,1678027273,0,'Old Lighthouse',200000,9,0,0,0,0,177,NULL,4),(3029,0,1678027273,0,'Market Street 1',600000,9,0,0,0,0,258,NULL,6),(3030,0,1678027273,0,'Market Street 3',600000,9,0,0,0,0,153,NULL,4),(3031,0,1678027273,0,'Market Street 4 (Shop)',800000,9,0,0,0,0,209,NULL,6),(3032,0,1678027273,0,'Market Street 5 (Shop)',800000,9,0,0,0,0,243,NULL,8),(3033,0,1678027273,0,'Market Street 2',600000,9,0,0,0,0,200,NULL,6),(3034,0,1678027273,0,'Loot Lane 1 (Shop)',600000,9,0,0,0,0,198,NULL,6),(3035,0,1678027273,0,'Mystic Lane 1',300000,9,0,0,0,0,110,NULL,6),(3036,0,1678027273,0,'Mystic Lane 2',200000,9,0,0,0,0,139,NULL,4),(3037,0,1678027273,0,'Lucky Lane 2 (Tower)',600000,9,0,0,0,0,240,NULL,4),(3038,0,1678027273,0,'Lucky Lane 3 (Tower)',600000,9,0,0,0,0,240,NULL,4),(3039,0,1678027273,0,'Iron Alley 1',300000,9,0,0,0,0,120,NULL,8),(3040,0,1678027273,0,'Iron Alley 2',300000,9,0,0,0,0,144,NULL,8),(3041,0,1678027273,0,'Swamp Watch',500000,9,0,0,0,0,420,NULL,24),(3042,0,1678027273,0,'Golden Axe Guildhall',500000,9,0,0,0,0,390,NULL,20),(3043,0,1678027273,0,'Silver Street 1',200000,9,0,0,0,0,125,NULL,2),(3044,0,1678027273,0,'Valorous Venore',500000,9,0,0,0,0,507,NULL,18),(3045,0,1678027273,0,'Salvation Street 2',300000,9,0,0,0,0,135,NULL,4),(3046,0,1678027273,0,'Salvation Street 3',300000,9,0,0,0,0,162,NULL,4),(3047,0,1678027273,0,'Silver Street 2',200000,9,0,0,0,0,84,NULL,2),(3048,0,1678027273,0,'Silver Street 3',200000,9,0,0,0,0,105,NULL,2),(3049,0,1678027273,0,'Mystic Lane 3 (Tower)',800000,9,0,0,0,0,245,NULL,0),(3050,0,1678027273,0,'Market Street 7',200000,9,0,0,0,0,114,NULL,4),(3051,0,1678027273,0,'Market Street 6',600000,9,0,0,0,0,216,NULL,10),(3052,0,1678027273,0,'Iron Alley Watch, Upper',600000,9,0,0,0,0,252,NULL,6),(3053,0,1678027273,0,'Iron Alley Watch, Lower',600000,9,0,0,0,0,240,NULL,4),(3054,0,1678027273,0,'Blessed Shield Guildhall',500000,9,0,0,0,0,289,NULL,18),(3055,0,1678027273,0,'Steel Home',500000,9,0,0,0,0,441,NULL,26),(3056,0,1678027273,0,'Salvation Street 1 (Shop)',600000,9,0,0,0,0,249,NULL,8),(3057,0,1678027273,0,'Lucky Lane 1 (Shop)',800000,9,0,0,0,0,253,NULL,8),(3058,0,1678027273,0,'Paupers Palace, Flat 34',100000,9,0,0,0,0,60,NULL,3),(3059,0,1678027273,0,'Paupers Palace, Flat 33',50000,9,0,0,0,0,35,NULL,2),(3060,0,1678027273,0,'Paupers Palace, Flat 32',100000,9,0,0,0,0,50,NULL,4),(3061,0,1678027273,0,'Paupers Palace, Flat 31',80000,9,0,0,0,0,40,NULL,2),(3062,0,1678027273,0,'Paupers Palace, Flat 28',25000,9,0,0,0,0,15,NULL,2),(3063,0,1678027273,0,'Paupers Palace, Flat 26',25000,9,0,0,0,0,20,NULL,2),(3064,0,1678027273,0,'Paupers Palace, Flat 24',25000,9,0,0,0,0,20,NULL,2),(3065,0,1678027273,0,'Paupers Palace, Flat 22',25000,9,0,0,0,0,20,NULL,2),(3066,0,1678027273,0,'Paupers Palace, Flat 21',25000,9,0,0,0,0,20,NULL,2),(3067,0,1678027273,0,'Paupers Palace, Flat 27',50000,9,0,0,0,0,25,NULL,4),(3068,0,1678027273,0,'Paupers Palace, Flat 25',50000,9,0,0,0,0,25,NULL,2),(3069,0,1678027273,0,'Paupers Palace, Flat 23',50000,9,0,0,0,0,30,NULL,2),(3070,0,1678027273,0,'Paupers Palace, Flat 11',25000,9,0,0,0,0,15,NULL,2),(3071,0,1678027273,0,'Paupers Palace, Flat 13',50000,9,0,0,0,0,20,NULL,2),(3072,0,1678027273,0,'Paupers Palace, Flat 15',50000,9,0,0,0,0,20,NULL,2),(3073,0,1678027273,0,'Paupers Palace, Flat 17',25000,9,0,0,0,0,20,NULL,2),(3074,0,1678027273,0,'Paupers Palace, Flat 18',25000,9,0,0,0,0,20,NULL,2),(3075,0,1678027273,0,'Paupers Palace, Flat 12',50000,9,0,0,0,0,25,NULL,4),(3076,0,1678027273,0,'Paupers Palace, Flat 14',50000,9,0,0,0,0,25,NULL,2),(3077,0,1678027273,0,'Paupers Palace, Flat 16',50000,9,0,0,0,0,30,NULL,2),(3078,0,1678027273,0,'Paupers Palace, Flat 06',25000,9,0,0,0,0,20,NULL,2),(3079,0,1678027273,0,'Paupers Palace, Flat 05',25000,9,0,0,0,0,15,NULL,2),(3080,0,1678027273,0,'Paupers Palace, Flat 04',25000,9,0,0,0,0,25,NULL,2),(3081,0,1678027273,0,'Paupers Palace, Flat 07',50000,9,0,0,0,0,23,NULL,4),(3082,0,1678027273,0,'Paupers Palace, Flat 03',25000,9,0,0,0,0,20,NULL,2),(3083,0,1678027273,0,'Paupers Palace, Flat 02',25000,9,0,0,0,0,25,NULL,2),(3084,0,1678027273,0,'Paupers Palace, Flat 01',25000,9,0,0,0,0,24,NULL,2),(3085,0,1678027273,0,'Castle, Residence',600000,11,0,0,0,0,182,NULL,0),(3086,0,1678027273,0,'Castle, 3rd Floor, Flat 07',80000,11,0,0,0,0,30,NULL,2),(3087,0,1678027273,0,'Castle, 3rd Floor, Flat 04',25000,11,0,0,0,0,25,NULL,2),(3088,0,1678027273,0,'Castle, 3rd Floor, Flat 03',50000,11,0,0,0,0,30,NULL,2),(3089,0,1678027273,0,'Castle, 3rd Floor, Flat 06',100000,11,0,0,0,0,36,NULL,4),(3090,0,1678027273,0,'Castle, 3rd Floor, Flat 05',80000,11,0,0,0,0,30,NULL,2),(3091,0,1678027273,0,'Castle, 3rd Floor, Flat 02',80000,11,0,0,0,0,30,NULL,2),(3092,0,1678027273,0,'Castle, 3rd Floor, Flat 01',50000,11,0,0,0,0,30,NULL,2),(3093,0,1678027273,0,'Castle, 4th Floor, Flat 09',50000,11,0,0,0,0,28,NULL,2),(3094,0,1678027273,0,'Castle, 4th Floor, Flat 08',80000,11,0,0,0,0,42,NULL,2),(3095,0,1678027273,0,'Castle, 4th Floor, Flat 07',80000,11,0,0,0,0,30,NULL,2),(3096,0,1678027273,0,'Castle, 4th Floor, Flat 04',50000,11,0,0,0,0,25,NULL,2),(3097,0,1678027273,0,'Castle, 4th Floor, Flat 03',50000,11,0,0,0,0,30,NULL,2),(3098,0,1678027273,0,'Castle, 4th Floor, Flat 06',100000,11,0,0,0,0,36,NULL,2),(3099,0,1678027273,0,'Castle, 4th Floor, Flat 05',80000,11,0,0,0,0,30,NULL,2),(3100,0,1678027273,0,'Castle, 4th Floor, Flat 02',80000,11,0,0,0,0,30,NULL,2),(3101,0,1678027273,0,'Castle, 4th Floor, Flat 01',50000,11,0,0,0,0,30,NULL,2),(3102,0,1678027273,0,'Castle Street 2',150000,11,0,0,0,0,56,NULL,4),(3103,0,1678027273,0,'Castle Street 3',150000,11,0,0,0,0,64,NULL,4),(3104,0,1678027273,0,'Castle Street 4',150000,11,0,0,0,0,61,NULL,4),(3105,0,1678027273,0,'Castle Street 5',150000,11,0,0,0,0,64,NULL,4),(3106,0,1678027273,0,'Castle Street 1',300000,11,0,0,0,0,112,NULL,6),(3107,0,1678027273,0,'Edron Flats, Flat 08',25000,11,0,0,0,0,20,NULL,2),(3108,0,1678027273,0,'Edron Flats, Flat 05',25000,11,0,0,0,0,20,NULL,2),(3109,0,1678027273,0,'Edron Flats, Flat 04',25000,11,0,0,0,0,25,NULL,2),(3110,0,1678027273,0,'Edron Flats, Flat 01',50000,11,0,0,0,0,25,NULL,2),(3111,0,1678027273,0,'Edron Flats, Flat 07',25000,11,0,0,0,0,20,NULL,2),(3112,0,1678027273,0,'Edron Flats, Flat 06',25000,11,0,0,0,0,20,NULL,2),(3113,0,1678027273,0,'Edron Flats, Flat 03',25000,11,0,0,0,0,20,NULL,2),(3114,0,1678027273,0,'Edron Flats, Flat 02',100000,11,0,0,0,0,40,NULL,4),(3115,0,1678027273,0,'Edron Flats, Basement Flat 2',100000,11,0,0,0,0,54,NULL,4),(3116,0,1678027273,0,'Edron Flats, Basement Flat 1',100000,11,0,0,0,0,63,NULL,4),(3119,0,1678027273,0,'Edron Flats, Flat 13',80000,11,0,0,0,0,45,NULL,4),(3121,0,1678027273,0,'Edron Flats, Flat 14',100000,11,0,0,0,0,50,NULL,4),(3123,0,1678027273,0,'Edron Flats, Flat 12',80000,11,0,0,0,0,45,NULL,4),(3124,0,1678027273,0,'Edron Flats, Flat 11',100000,11,0,0,0,0,60,NULL,4),(3125,0,1678027273,0,'Edron Flats, Flat 25',80000,11,0,0,0,0,60,NULL,4),(3127,0,1678027273,0,'Edron Flats, Flat 24',80000,11,0,0,0,0,35,NULL,4),(3128,0,1678027273,0,'Edron Flats, Flat 21',80000,11,0,0,0,0,40,NULL,4),(3131,0,1678027273,0,'Edron Flats, Flat 23',80000,11,0,0,0,0,40,NULL,4),(3133,0,1678027273,0,'Castle Shop 1',400000,11,0,0,0,0,70,NULL,2),(3134,0,1678027273,0,'Castle Shop 2',400000,11,0,0,0,0,70,NULL,2),(3135,0,1678027273,0,'Castle Shop 3',300000,11,0,0,0,0,80,NULL,2),(3136,0,1678027273,0,'Central Circle 1',800000,11,0,0,0,0,98,NULL,4),(3137,0,1678027273,0,'Central Circle 2',800000,11,0,0,0,0,120,NULL,4),(3138,0,1678027273,0,'Central Circle 3',800000,11,0,0,0,0,147,NULL,10),(3139,0,1678027273,0,'Central Circle 4',800000,11,0,0,0,0,147,NULL,10),(3140,0,1678027273,0,'Central Circle 5',800000,11,0,0,0,0,168,NULL,10),(3141,0,1678027273,0,'Central Circle 8 (Shop)',400000,11,0,0,0,0,168,NULL,4),(3142,0,1678027273,0,'Central Circle 7 (Shop)',400000,11,0,0,0,0,168,NULL,4),(3143,0,1678027273,0,'Central Circle 6 (Shop)',400000,11,0,0,0,0,192,NULL,4),(3144,0,1678027273,0,'Central Circle 9a',150000,11,0,0,0,0,42,NULL,4),(3145,0,1678027273,0,'Central Circle 9b',150000,11,0,0,0,0,42,NULL,4),(3146,0,1678027273,0,'Sky Lane, Guild 1',1000000,11,0,0,0,0,663,NULL,46),(3147,0,1678027273,0,'Sky Lane, Sea Tower',300000,11,0,0,0,0,196,NULL,12),(3148,0,1678027273,0,'Sky Lane, Guild 3',1000000,11,0,0,0,0,507,NULL,36),(3149,0,1678027273,0,'Sky Lane, Guild 2',1000000,11,0,0,0,0,653,NULL,28),(3150,0,1678027273,0,'Wood Avenue 11',600000,11,0,0,0,0,245,NULL,12),(3151,0,1678027273,0,'Wood Avenue 8',800000,11,0,0,0,0,218,NULL,6),(3152,0,1678027273,0,'Wood Avenue 7',800000,11,0,0,0,0,232,NULL,6),(3153,0,1678027273,0,'Wood Avenue 10a',200000,11,0,0,0,0,56,NULL,4),(3154,0,1678027273,0,'Wood Avenue 9a',200000,11,0,0,0,0,56,NULL,4),(3155,0,1678027273,0,'Wood Avenue 6a',300000,11,0,0,0,0,64,NULL,4),(3156,0,1678027273,0,'Wood Avenue 6b',200000,11,0,0,0,0,56,NULL,4),(3157,0,1678027273,0,'Wood Avenue 9b',200000,11,0,0,0,0,56,NULL,4),(3158,0,1678027273,0,'Wood Avenue 10b',200000,11,0,0,0,0,64,NULL,6),(3159,0,1678027273,0,'Stronghold',800000,11,0,0,0,0,285,NULL,0),(3160,0,1678027273,0,'Wood Avenue 5',300000,11,0,0,0,0,64,NULL,4),(3161,0,1678027273,0,'Wood Avenue 3',200000,11,0,0,0,0,52,NULL,4),(3162,0,1678027273,0,'Wood Avenue 4',200000,11,0,0,0,0,60,NULL,4),(3163,0,1678027273,0,'Wood Avenue 2',200000,11,0,0,0,0,64,NULL,4),(3164,0,1678027273,0,'Wood Avenue 1',200000,11,0,0,0,0,64,NULL,4),(3165,0,1678027273,0,'Wood Avenue 4c',200000,11,0,0,0,0,57,NULL,4),(3166,0,1678027273,0,'Wood Avenue 4a',150000,11,0,0,0,0,56,NULL,4),(3167,0,1678027273,0,'Wood Avenue 4b',150000,11,0,0,0,0,56,NULL,4),(3168,0,1678027273,0,'Stonehome Village 1',150000,11,0,0,0,0,77,NULL,4),(3169,0,1678027273,0,'Stonehome Flats, Flat 04',80000,11,0,0,0,0,45,NULL,4),(3171,0,1678027273,0,'Stonehome Flats, Flat 03',80000,11,0,0,0,0,45,NULL,4),(3173,0,1678027273,0,'Stonehome Flats, Flat 02',25000,11,0,0,0,0,30,NULL,4),(3174,0,1678027273,0,'Stonehome Flats, Flat 01',25000,11,0,0,0,0,25,NULL,2),(3175,0,1678027273,0,'Stonehome Flats, Flat 13',80000,11,0,0,0,0,45,NULL,4),(3177,0,1678027273,0,'Stonehome Flats, Flat 11',50000,11,0,0,0,0,30,NULL,4),(3178,0,1678027273,0,'Stonehome Flats, Flat 14',80000,11,0,0,0,0,45,NULL,4),(3180,0,1678027273,0,'Stonehome Flats, Flat 12',50000,11,0,0,0,0,30,NULL,4),(3181,0,1678027273,0,'Stonehome Village 2',50000,11,0,0,0,0,35,NULL,2),(3182,0,1678027273,0,'Stonehome Village 3',50000,11,0,0,0,0,36,NULL,2),(3183,0,1678027273,0,'Stonehome Village 4',80000,11,0,0,0,0,42,NULL,4),(3184,0,1678027273,0,'Stonehome Village 6',100000,11,0,0,0,0,55,NULL,4),(3185,0,1678027273,0,'Stonehome Village 5',80000,11,0,0,0,0,49,NULL,4),(3186,0,1678027273,0,'Stonehome Village 7',100000,11,0,0,0,0,49,NULL,4),(3187,0,1678027273,0,'Stonehome Village 8',25000,11,0,0,0,0,36,NULL,2),(3188,0,1678027273,0,'Stonehome Village 9',50000,11,0,0,0,0,36,NULL,2),(3189,0,1678027273,0,'Stonehome Clanhall',250000,11,0,0,0,0,364,NULL,18),(3190,0,1678027273,0,'Mad Scientist\'s Lab',600000,17,0,0,0,0,115,NULL,0),(3191,0,1678027273,0,'Radiant Plaza 4',800000,17,0,0,0,0,361,NULL,6),(3192,0,1678027273,0,'Radiant Plaza 3',800000,17,0,0,0,0,245,NULL,4),(3193,0,1678027273,0,'Radiant Plaza 2',600000,17,0,0,0,0,153,NULL,4),(3194,0,1678027273,0,'Radiant Plaza 1',800000,17,0,0,0,0,257,NULL,8),(3195,0,1678027273,0,'Aureate Court 3',400000,17,0,0,0,0,226,NULL,4),(3196,0,1678027273,0,'Aureate Court 4',400000,17,0,0,0,0,185,NULL,8),(3197,0,1678027273,0,'Aureate Court 5',600000,17,0,0,0,0,201,NULL,0),(3198,0,1678027273,0,'Aureate Court 2',400000,17,0,0,0,0,176,NULL,4),(3199,0,1678027273,0,'Aureate Court 1',600000,17,0,0,0,0,264,NULL,6),(3205,0,1678027273,0,'Halls of Serenity',5000000,17,0,0,0,0,1026,NULL,66),(3206,0,1678027273,0,'Fortune Wing 3',600000,17,0,0,0,0,235,NULL,4),(3207,0,1678027273,0,'Fortune Wing 4',600000,17,0,0,0,0,252,NULL,8),(3208,0,1678027273,0,'Fortune Wing 2',600000,17,0,0,0,0,260,NULL,4),(3209,0,1678027273,0,'Fortune Wing 1',800000,17,0,0,0,0,400,NULL,8),(3211,0,1678027273,0,'Cascade Towers',5000000,17,0,0,0,0,739,NULL,66),(3212,0,1678027273,0,'Luminous Arc 5',800000,17,0,0,0,0,196,NULL,0),(3213,0,1678027273,0,'Luminous Arc 2',600000,17,0,0,0,0,298,NULL,8),(3214,0,1678027273,0,'Luminous Arc 1',800000,17,0,0,0,0,341,NULL,4),(3215,0,1678027273,0,'Luminous Arc 3',600000,17,0,0,0,0,228,NULL,6),(3216,0,1678027273,0,'Luminous Arc 4',800000,17,0,0,0,0,326,NULL,10),(3217,0,1678027273,0,'Harbour Promenade 1',800000,17,0,0,0,0,205,NULL,0),(3218,0,1678027273,0,'Sun Palace',5000000,17,0,0,0,0,926,NULL,54),(3219,0,1678027273,0,'Haggler\'s Hangout 3',300000,15,0,0,0,0,241,NULL,8),(3220,0,1678027273,0,'Haggler\'s Hangout 7',400000,15,0,0,0,0,240,NULL,0),(3221,0,1678027273,0,'Big Game Hunter\'s Lodge',600000,15,0,0,0,0,257,NULL,0),(3222,0,1678027273,0,'Haggler\'s Hangout 6',400000,15,0,0,0,0,188,NULL,8),(3223,0,1678027273,0,'Haggler\'s Hangout 5 (Shop)',200000,15,0,0,0,0,56,NULL,2),(3224,0,1678027273,0,'Haggler\'s Hangout 4b (Shop)',150000,15,0,0,0,0,48,NULL,2),(3225,0,1678027273,0,'Haggler\'s Hangout 4a (Shop)',200000,15,0,0,0,0,64,NULL,2),(3226,0,1678027273,0,'Haggler\'s Hangout 2',100000,15,0,0,0,0,49,NULL,2),(3227,0,1678027273,0,'Haggler\'s Hangout 1',100000,15,0,0,0,0,49,NULL,4),(3228,0,1678027273,0,'Bamboo Garden 3',150000,15,0,0,0,0,63,NULL,4),(3229,0,1678027273,0,'Bamboo Fortress',500000,15,0,0,0,0,762,NULL,40),(3230,0,1678027273,0,'Bamboo Garden 2',80000,15,0,0,0,0,42,NULL,4),(3231,0,1678027273,0,'Bamboo Garden 1',100000,15,0,0,0,0,63,NULL,6),(3232,0,1678027273,0,'Banana Bay 4',25000,15,0,0,0,0,25,NULL,2),(3233,0,1678027273,0,'Banana Bay 2',50000,15,0,0,0,0,36,NULL,2),(3234,0,1678027273,0,'Banana Bay 3',50000,15,0,0,0,0,25,NULL,2),(3235,0,1678027273,0,'Banana Bay 1',25000,15,0,0,0,0,25,NULL,2),(3236,0,1678027273,0,'Crocodile Bridge 1',80000,15,0,0,0,0,42,NULL,4),(3237,0,1678027273,0,'Crocodile Bridge 2',80000,15,0,0,0,0,36,NULL,4),(3238,0,1678027273,0,'Crocodile Bridge 3',100000,15,0,0,0,0,49,NULL,4),(3239,0,1678027273,0,'Crocodile Bridge 4',300000,15,0,0,0,0,158,NULL,8),(3240,0,1678027273,0,'Crocodile Bridge 5',200000,15,0,0,0,0,137,NULL,4),(3241,0,1678027273,0,'Woodway 1',80000,15,0,0,0,0,25,NULL,2),(3242,0,1678027273,0,'Woodway 2',50000,15,0,0,0,0,20,NULL,2),(3243,0,1678027273,0,'Woodway 3',150000,15,0,0,0,0,65,NULL,4),(3244,0,1678027273,0,'Woodway 4',25000,15,0,0,0,0,24,NULL,2),(3245,0,1678027273,0,'Flamingo Flats 5',150000,15,0,0,0,0,72,NULL,2),(3246,0,1678027273,0,'Flamingo Flats 4',80000,15,0,0,0,0,36,NULL,4),(3247,0,1678027273,0,'Flamingo Flats 1',50000,15,0,0,0,0,30,NULL,4),(3248,0,1678027273,0,'Flamingo Flats 2',80000,15,0,0,0,0,42,NULL,4),(3249,0,1678027273,0,'Flamingo Flats 3',50000,15,0,0,0,0,30,NULL,4),(3250,0,1678027273,0,'Jungle Edge 1',200000,15,0,0,0,0,85,NULL,6),(3251,0,1678027273,0,'Jungle Edge 2',200000,15,0,0,0,0,128,NULL,6),(3252,0,1678027273,0,'Jungle Edge 4',80000,15,0,0,0,0,36,NULL,4),(3253,0,1678027273,0,'Jungle Edge 5',80000,15,0,0,0,0,36,NULL,4),(3254,0,1678027273,0,'Jungle Edge 6',25000,15,0,0,0,0,25,NULL,2),(3255,0,1678027273,0,'Jungle Edge 3',80000,15,0,0,0,0,36,NULL,4),(3256,0,1678027273,0,'River Homes 3',200000,15,0,0,0,0,140,NULL,14),(3257,0,1678027273,0,'River Homes 2b',150000,15,0,0,0,0,49,NULL,6),(3258,0,1678027273,0,'River Homes 2a',100000,15,0,0,0,0,49,NULL,4),(3259,0,1678027273,0,'River Homes 1',300000,15,0,0,0,0,128,NULL,6),(3260,0,1678027273,0,'Coconut Quay 4',150000,15,0,0,0,0,72,NULL,6),(3261,0,1678027273,0,'Coconut Quay 3',200000,15,0,0,0,0,70,NULL,8),(3262,0,1678027273,0,'Coconut Quay 2',100000,15,0,0,0,0,42,NULL,4),(3263,0,1678027273,0,'Coconut Quay 1',150000,15,0,0,0,0,64,NULL,4),(3264,0,1678027273,0,'Shark Manor',250000,15,0,0,0,0,240,NULL,30),(3265,0,1678027273,0,'Glacier Side 2',300000,16,0,0,0,0,154,NULL,6),(3266,0,1678027273,0,'Glacier Side 1',150000,16,0,0,0,0,65,NULL,4),(3267,0,1678027273,0,'Glacier Side 3',150000,16,0,0,0,0,75,NULL,4),(3268,0,1678027273,0,'Glacier Side 4',150000,16,0,0,0,0,70,NULL,2),(3269,0,1678027273,0,'Shelf Site',300000,16,0,0,0,0,145,NULL,6),(3270,0,1678027273,0,'Spirit Homes 5',150000,16,0,0,0,0,56,NULL,4),(3271,0,1678027273,0,'Spirit Homes 4',80000,16,0,0,0,0,49,NULL,2),(3272,0,1678027273,0,'Spirit Homes 1',150000,16,0,0,0,0,56,NULL,4),(3273,0,1678027273,0,'Spirit Homes 2',150000,16,0,0,0,0,72,NULL,4),(3274,0,1678027273,0,'Spirit Homes 3',300000,16,0,0,0,0,128,NULL,6),(3275,0,1678027273,0,'Arena Walk 3',300000,16,0,0,0,0,126,NULL,6),(3276,0,1678027273,0,'Arena Walk 2',150000,16,0,0,0,0,54,NULL,4),(3277,0,1678027273,0,'Arena Walk 1',300000,16,0,0,0,0,128,NULL,6),(3278,0,1678027273,0,'Bears Paw 2',300000,16,0,0,0,0,98,NULL,4),(3279,0,1678027273,0,'Bears Paw 1',200000,16,0,0,0,0,72,NULL,4),(3280,0,1678027273,0,'Crystal Glance',1000000,16,0,0,0,0,549,NULL,48),(3281,0,1678027273,0,'Shady Rocks 2',200000,16,0,0,0,0,77,NULL,8),(3282,0,1678027273,0,'Shady Rocks 1',300000,16,0,0,0,0,116,NULL,8),(3283,0,1678027273,0,'Shady Rocks 3',300000,16,0,0,0,0,137,NULL,6),(3284,0,1678027273,0,'Shady Rocks 4 (Shop)',200000,16,0,0,0,0,95,NULL,4),(3285,0,1678027273,0,'Shady Rocks 5',300000,16,0,0,0,0,110,NULL,4),(3286,0,1678027273,0,'Tusk Flats 2',80000,16,0,0,0,0,42,NULL,4),(3287,0,1678027273,0,'Tusk Flats 1',80000,16,0,0,0,0,40,NULL,4),(3288,0,1678027273,0,'Tusk Flats 3',80000,16,0,0,0,0,35,NULL,4),(3289,0,1678027273,0,'Tusk Flats 4',25000,16,0,0,0,0,24,NULL,2),(3290,0,1678027273,0,'Tusk Flats 6',50000,16,0,0,0,0,35,NULL,4),(3291,0,1678027273,0,'Tusk Flats 5',25000,16,0,0,0,0,30,NULL,2),(3292,0,1678027273,0,'Corner Shop (Shop)',200000,16,0,0,0,0,88,NULL,4),(3293,0,1678027273,0,'Bears Paw 5',200000,16,0,0,0,0,81,NULL,6),(3294,0,1678027273,0,'Bears Paw 4',400000,16,0,0,0,0,185,NULL,8),(3295,0,1678027273,0,'Trout Plaza 2',150000,16,0,0,0,0,64,NULL,4),(3296,0,1678027273,0,'Trout Plaza 1',200000,16,0,0,0,0,112,NULL,4),(3297,0,1678027273,0,'Trout Plaza 5 (Shop)',300000,16,0,0,0,0,135,NULL,4),(3298,0,1678027273,0,'Trout Plaza 3',80000,16,0,0,0,0,36,NULL,2),(3299,0,1678027273,0,'Trout Plaza 4',80000,16,0,0,0,0,45,NULL,2),(3300,0,1678027273,0,'Skiffs End 2',80000,16,0,0,0,0,42,NULL,4),(3301,0,1678027273,0,'Skiffs End 1',100000,16,0,0,0,0,70,NULL,4),(3302,0,1678027273,0,'Furrier Quarter 3',100000,16,0,0,0,0,54,NULL,4),(3303,0,1678027273,0,'Fimbul Shelf 4',100000,16,0,0,0,0,56,NULL,4),(3304,0,1678027273,0,'Fimbul Shelf 3',100000,16,0,0,0,0,66,NULL,4),(3305,0,1678027273,0,'Furrier Quarter 2',80000,16,0,0,0,0,56,NULL,4),(3306,0,1678027273,0,'Furrier Quarter 1',150000,16,0,0,0,0,84,NULL,6),(3307,0,1678027273,0,'Fimbul Shelf 2',100000,16,0,0,0,0,56,NULL,4),(3308,0,1678027273,0,'Fimbul Shelf 1',80000,16,0,0,0,0,48,NULL,4),(3309,0,1678027273,0,'Bears Paw 3',200000,16,0,0,0,0,82,NULL,6),(3310,0,1678027273,0,'Raven Corner 2',150000,16,0,0,0,0,60,NULL,6),(3311,0,1678027273,0,'Raven Corner 1',80000,16,0,0,0,0,45,NULL,2),(3312,0,1678027273,0,'Raven Corner 3',100000,16,0,0,0,0,45,NULL,2),(3313,0,1678027273,0,'Mammoth Belly',1000000,16,0,0,0,0,634,NULL,60),(3314,0,1678027273,0,'Darashia 3, Flat 01',150000,13,0,0,0,0,42,NULL,4),(3315,0,1678027273,0,'Darashia 3, Flat 05',150000,13,0,0,0,0,42,NULL,2),(3316,0,1678027273,0,'Darashia 3, Flat 02',200000,13,0,0,0,0,66,NULL,4),(3317,0,1678027273,0,'Darashia 3, Flat 04',150000,13,0,0,0,0,66,NULL,4),(3318,0,1678027273,0,'Darashia 3, Flat 03',150000,13,0,0,0,0,48,NULL,4),(3319,0,1678027273,0,'Darashia 3, Flat 12',200000,13,0,0,0,0,90,NULL,10),(3320,0,1678027273,0,'Darashia 3, Flat 11',100000,13,0,0,0,0,42,NULL,2),(3321,0,1678027273,0,'Darashia 3, Flat 14',200000,13,0,0,0,0,96,NULL,6),(3322,0,1678027273,0,'Darashia 3, Flat 13',100000,13,0,0,0,0,48,NULL,4),(3323,0,1678027273,0,'Darashia 8, Flat 01',300000,13,0,0,0,0,82,NULL,4),(3325,0,1678027273,0,'Darashia 8, Flat 05',300000,13,0,0,0,0,92,NULL,4),(3326,0,1678027273,0,'Darashia 8, Flat 04',200000,13,0,0,0,0,90,NULL,4),(3327,0,1678027273,0,'Darashia 8, Flat 03',300000,13,0,0,0,0,171,NULL,6),(3328,0,1678027273,0,'Darashia 8, Flat 12',150000,13,0,0,0,0,60,NULL,4),(3329,0,1678027273,0,'Darashia 8, Flat 11',200000,13,0,0,0,0,72,NULL,4),(3330,0,1678027273,0,'Darashia 8, Flat 14',150000,13,0,0,0,0,66,NULL,4),(3331,0,1678027273,0,'Darashia 8, Flat 13',150000,13,0,0,0,0,78,NULL,4),(3332,0,1678027273,0,'Darashia, Villa',800000,13,0,0,0,0,233,NULL,8),(3333,0,1678027273,0,'Darashia, Eastern Guildhall',1000000,13,0,0,0,0,456,NULL,32),(3334,0,1678027273,0,'Darashia, Western Guildhall',500000,13,0,0,0,0,376,NULL,28),(3335,0,1678027273,0,'Darashia 2, Flat 03',100000,13,0,0,0,0,42,NULL,2),(3336,0,1678027273,0,'Darashia 2, Flat 02',100000,13,0,0,0,0,42,NULL,2),(3337,0,1678027273,0,'Darashia 2, Flat 01',150000,13,0,0,0,0,48,NULL,2),(3338,0,1678027273,0,'Darashia 2, Flat 04',80000,13,0,0,0,0,24,NULL,2),(3339,0,1678027273,0,'Darashia 2, Flat 05',150000,13,0,0,0,0,48,NULL,4),(3340,0,1678027273,0,'Darashia 2, Flat 06',80000,13,0,0,0,0,24,NULL,2),(3341,0,1678027273,0,'Darashia 2, Flat 07',150000,13,0,0,0,0,48,NULL,2),(3342,0,1678027273,0,'Darashia 2, Flat 13',100000,13,0,0,0,0,42,NULL,2),(3343,0,1678027273,0,'Darashia 2, Flat 14',50000,13,0,0,0,0,24,NULL,2),(3344,0,1678027273,0,'Darashia 2, Flat 15',100000,13,0,0,0,0,48,NULL,4),(3345,0,1678027273,0,'Darashia 2, Flat 16',80000,13,0,0,0,0,30,NULL,2),(3346,0,1678027273,0,'Darashia 2, Flat 17',100000,13,0,0,0,0,42,NULL,2),(3347,0,1678027273,0,'Darashia 2, Flat 18',100000,13,0,0,0,0,30,NULL,2),(3348,0,1678027273,0,'Darashia 2, Flat 11',100000,13,0,0,0,0,42,NULL,2),(3349,0,1678027273,0,'Darashia 2, Flat 12',80000,13,0,0,0,0,30,NULL,2),(3350,0,1678027273,0,'Darashia 1, Flat 03',300000,13,0,0,0,0,96,NULL,8),(3351,0,1678027273,0,'Darashia 1, Flat 04',100000,13,0,0,0,0,42,NULL,2),(3352,0,1678027273,0,'Darashia 1, Flat 02',100000,13,0,0,0,0,42,NULL,2),(3353,0,1678027273,0,'Darashia 1, Flat 01',100000,13,0,0,0,0,48,NULL,4),(3354,0,1678027273,0,'Darashia 1, Flat 05',100000,13,0,0,0,0,48,NULL,4),(3355,0,1678027273,0,'Darashia 1, Flat 12',150000,13,0,0,0,0,66,NULL,4),(3356,0,1678027273,0,'Darashia 1, Flat 13',150000,13,0,0,0,0,72,NULL,4),(3357,0,1678027273,0,'Darashia 1, Flat 14',200000,13,0,0,0,0,102,NULL,10),(3358,0,1678027273,0,'Darashia 1, Flat 11',100000,13,0,0,0,0,48,NULL,4),(3359,0,1678027273,0,'Darashia 5, Flat 02',150000,13,0,0,0,0,60,NULL,4),(3360,0,1678027273,0,'Darashia 5, Flat 01',150000,13,0,0,0,0,48,NULL,2),(3361,0,1678027273,0,'Darashia 5, Flat 05',100000,13,0,0,0,0,42,NULL,2),(3362,0,1678027273,0,'Darashia 5, Flat 04',150000,13,0,0,0,0,66,NULL,4),(3363,0,1678027273,0,'Darashia 5, Flat 03',150000,13,0,0,0,0,48,NULL,2),(3364,0,1678027273,0,'Darashia 5, Flat 11',150000,13,0,0,0,0,66,NULL,4),(3365,0,1678027273,0,'Darashia 5, Flat 12',150000,13,0,0,0,0,66,NULL,4),(3366,0,1678027273,0,'Darashia 5, Flat 13',150000,13,0,0,0,0,72,NULL,4),(3367,0,1678027273,0,'Darashia 5, Flat 14',150000,13,0,0,0,0,72,NULL,4),(3368,0,1678027273,0,'Darashia 6a',300000,13,0,0,0,0,117,NULL,4),(3369,0,1678027273,0,'Darashia 6b',300000,13,0,0,0,0,139,NULL,4),(3370,0,1678027273,0,'Darashia 4, Flat 02',200000,13,0,0,0,0,66,NULL,4),(3371,0,1678027273,0,'Darashia 4, Flat 03',150000,13,0,0,0,0,42,NULL,2),(3372,0,1678027273,0,'Darashia 4, Flat 04',200000,13,0,0,0,0,72,NULL,4),(3373,0,1678027273,0,'Darashia 4, Flat 05',150000,13,0,0,0,0,48,NULL,4),(3374,0,1678027273,0,'Darashia 4, Flat 01',100000,13,0,0,0,0,48,NULL,2),(3375,0,1678027273,0,'Darashia 4, Flat 12',200000,13,0,0,0,0,96,NULL,6),(3376,0,1678027273,0,'Darashia 4, Flat 11',100000,13,0,0,0,0,42,NULL,2),(3377,0,1678027273,0,'Darashia 4, Flat 13',200000,13,0,0,0,0,72,NULL,4),(3378,0,1678027273,0,'Darashia 4, Flat 14',150000,13,0,0,0,0,78,NULL,4),(3379,0,1678027273,0,'Darashia 7, Flat 01',100000,13,0,0,0,0,42,NULL,2),(3380,0,1678027273,0,'Darashia 7, Flat 02',100000,13,0,0,0,0,42,NULL,2),(3381,0,1678027273,0,'Darashia 7, Flat 03',200000,13,0,0,0,0,102,NULL,8),(3382,0,1678027273,0,'Darashia 7, Flat 05',150000,13,0,0,0,0,42,NULL,4),(3383,0,1678027273,0,'Darashia 7, Flat 04',150000,13,0,0,0,0,48,NULL,2),(3384,0,1678027273,0,'Darashia 7, Flat 12',200000,13,0,0,0,0,96,NULL,8),(3385,0,1678027273,0,'Darashia 7, Flat 11',100000,13,0,0,0,0,42,NULL,2),(3386,0,1678027273,0,'Darashia 7, Flat 14',200000,13,0,0,0,0,102,NULL,8),(3387,0,1678027273,0,'Darashia 7, Flat 13',100000,13,0,0,0,0,48,NULL,2),(3388,0,1678027273,0,'Pirate Shipwreck 1',800000,13,0,0,0,0,205,NULL,0),(3389,0,1678027273,0,'Pirate Shipwreck 2',800000,13,0,0,0,0,294,NULL,0),(3390,0,1678027273,0,'The Shelter',250000,14,0,0,0,0,560,NULL,62),(3391,0,1678027273,0,'Litter Promenade 1',25000,14,0,0,0,0,25,NULL,4),(3392,0,1678027273,0,'Litter Promenade 2',50000,14,0,0,0,0,25,NULL,2),(3394,0,1678027273,0,'Litter Promenade 3',25000,14,0,0,0,0,36,NULL,2),(3395,0,1678027273,0,'Litter Promenade 4',25000,14,0,0,0,0,30,NULL,2),(3396,0,1678027273,0,'Rum Alley 3',25000,14,0,0,0,0,28,NULL,2),(3397,0,1678027273,0,'Straycat\'s Corner 5',80000,14,0,0,0,0,48,NULL,4),(3398,0,1678027273,0,'Straycat\'s Corner 6',25000,14,0,0,0,0,25,NULL,2),(3399,0,1678027273,0,'Litter Promenade 5',25000,14,0,0,0,0,35,NULL,4),(3401,0,1678027273,0,'Straycat\'s Corner 4',50000,14,0,0,0,0,40,NULL,4),(3402,0,1678027273,0,'Straycat\'s Corner 2',50000,14,0,0,0,0,49,NULL,2),(3403,0,1678027273,0,'Straycat\'s Corner 1',25000,14,0,0,0,0,25,NULL,2),(3404,0,1678027273,0,'Rum Alley 2',25000,14,0,0,0,0,25,NULL,2),(3405,0,1678027273,0,'Rum Alley 1',25000,14,0,0,0,0,36,NULL,2),(3406,0,1678027273,0,'Smuggler Backyard 3',50000,14,0,0,0,0,40,NULL,4),(3407,0,1678027273,0,'Shady Trail 3',25000,14,0,0,0,0,25,NULL,2),(3408,0,1678027273,0,'Shady Trail 1',100000,14,0,0,0,0,48,NULL,10),(3409,0,1678027273,0,'Shady Trail 2',25000,14,0,0,0,0,30,NULL,4),(3410,0,1678027273,0,'Smuggler Backyard 4',25000,14,0,0,0,0,30,NULL,2),(3411,0,1678027273,0,'Smuggler Backyard 2',25000,14,0,0,0,0,40,NULL,4),(3412,0,1678027273,0,'Smuggler Backyard 1',25000,14,0,0,0,0,40,NULL,4),(3413,0,1678027273,0,'Smuggler Backyard 5',25000,14,0,0,0,0,35,NULL,4),(3414,0,1678027273,0,'Sugar Street 1',200000,14,0,0,0,0,84,NULL,6),(3415,0,1678027273,0,'Sugar Street 2',150000,14,0,0,0,0,84,NULL,6),(3416,0,1678027273,0,'Sugar Street 3a',100000,14,0,0,0,0,48,NULL,6),(3417,0,1678027273,0,'Sugar Street 3b',150000,14,0,0,0,0,66,NULL,6),(3418,0,1678027273,0,'Sugar Street 4d',50000,14,0,0,0,0,24,NULL,4),(3419,0,1678027273,0,'Sugar Street 4c',25000,14,0,0,0,0,24,NULL,2),(3420,0,1678027273,0,'Sugar Street 4b',100000,14,0,0,0,0,30,NULL,4),(3421,0,1678027273,0,'Sugar Street 4a',80000,14,0,0,0,0,36,NULL,4),(3422,0,1678027273,0,'Harvester\'s Haven, Flat 01',50000,14,0,0,0,0,30,NULL,4),(3423,0,1678027273,0,'Harvester\'s Haven, Flat 03',50000,14,0,0,0,0,30,NULL,4),(3424,0,1678027273,0,'Harvester\'s Haven, Flat 05',50000,14,0,0,0,0,36,NULL,4),(3425,0,1678027273,0,'Harvester\'s Haven, Flat 06',50000,14,0,0,0,0,30,NULL,4),(3426,0,1678027273,0,'Harvester\'s Haven, Flat 04',50000,14,0,0,0,0,30,NULL,4),(3427,0,1678027273,0,'Harvester\'s Haven, Flat 02',50000,14,0,0,0,0,36,NULL,4),(3428,0,1678027273,0,'Harvester\'s Haven, Flat 07',80000,14,0,0,0,0,30,NULL,4),(3429,0,1678027273,0,'Harvester\'s Haven, Flat 09',50000,14,0,0,0,0,30,NULL,4),(3430,0,1678027273,0,'Harvester\'s Haven, Flat 11',25000,14,0,0,0,0,36,NULL,4),(3431,0,1678027273,0,'Harvester\'s Haven, Flat 08',50000,14,0,0,0,0,30,NULL,4),(3432,0,1678027273,0,'Harvester\'s Haven, Flat 10',50000,14,0,0,0,0,30,NULL,4),(3433,0,1678027273,0,'Harvester\'s Haven, Flat 12',25000,14,0,0,0,0,36,NULL,4),(3434,0,1678027273,0,'Marble Lane 3',600000,14,0,0,0,0,240,NULL,8),(3435,0,1678027273,0,'Marble Lane 2',400000,14,0,0,0,0,200,NULL,6),(3436,0,1678027273,0,'Marble Lane 4',400000,14,0,0,0,0,192,NULL,8),(3437,0,1678027273,0,'Admiral\'s Avenue 1',400000,14,0,0,0,0,176,NULL,4),(3438,0,1678027273,0,'Admiral\'s Avenue 2',400000,14,0,0,0,0,183,NULL,8),(3439,0,1678027273,0,'Admiral\'s Avenue 3',300000,14,0,0,0,0,144,NULL,4),(3440,0,1678027273,0,'Ivory Circle 1',400000,14,0,0,0,0,160,NULL,4),(3441,0,1678027273,0,'Sugar Street 5',150000,14,0,0,0,0,48,NULL,4),(3442,0,1678027273,0,'Freedom Street 1',200000,14,0,0,0,0,84,NULL,4),(3443,0,1678027273,0,'Trader\'s Point 1',200000,14,0,0,0,0,77,NULL,4),(3444,0,1678027273,0,'Trader\'s Point 2 (Shop)',600000,14,0,0,0,0,195,NULL,4),(3445,0,1678027273,0,'Trader\'s Point 3 (Shop)',600000,14,0,0,0,0,198,NULL,4),(3446,0,1678027273,0,'Ivory Mansion',800000,14,0,0,0,0,455,NULL,0),(3447,0,1678027273,0,'Ivory Circle 2',400000,14,0,0,0,0,196,NULL,4),(3448,0,1678027273,0,'Ivy Cottage',500000,14,0,0,0,0,875,NULL,52),(3449,0,1678027273,0,'Marble Lane 1',600000,14,0,0,0,0,320,NULL,12),(3450,0,1678027273,0,'Freedom Street 2',400000,14,0,0,0,0,208,NULL,8),(3452,0,1678027273,0,'Meriana Beach',150000,14,0,0,0,0,219,NULL,6),(3453,0,1678027273,0,'The Tavern 1a',150000,14,0,0,0,0,73,NULL,8),(3454,0,1678027273,0,'The Tavern 1b',100000,14,0,0,0,0,54,NULL,4),(3455,0,1678027273,0,'The Tavern 1c',200000,14,0,0,0,0,126,NULL,6),(3456,0,1678027273,0,'The Tavern 1d',100000,14,0,0,0,0,54,NULL,4),(3457,0,1678027273,0,'The Tavern 2a',300000,14,0,0,0,0,163,NULL,10),(3458,0,1678027273,0,'The Tavern 2b',100000,14,0,0,0,0,57,NULL,4),(3459,0,1678027273,0,'The Tavern 2d',100000,14,0,0,0,0,40,NULL,4),(3460,0,1678027273,0,'The Tavern 2c',50000,14,0,0,0,0,40,NULL,2),(3461,0,1678027273,0,'The Yeah Beach Project',150000,14,0,0,0,0,202,NULL,6),(3462,0,1678027273,0,'Mountain Hideout',500000,14,0,0,0,0,511,NULL,34),(3463,0,1678027273,0,'Darashia 8, Flat 02',300000,13,0,0,0,0,135,NULL,4),(3464,0,1678027273,0,'Castle, Basement, Flat 01',50000,11,0,0,0,0,30,NULL,2),(3465,0,1678027273,0,'Castle, Basement, Flat 02',50000,11,0,0,0,0,24,NULL,2),(3466,0,1678027273,0,'Castle, Basement, Flat 03',50000,11,0,0,0,0,24,NULL,2),(3467,0,1678027273,0,'Castle, Basement, Flat 05',50000,11,0,0,0,0,24,NULL,2),(3468,0,1678027273,0,'Castle, Basement, Flat 04',50000,11,0,0,0,0,24,NULL,2),(3469,0,1678027273,0,'Castle, Basement, Flat 06',50000,11,0,0,0,0,24,NULL,2),(3470,0,1678027273,0,'Castle, Basement, Flat 07',50000,11,0,0,0,0,24,NULL,2),(3471,0,1678027273,0,'Castle, Basement, Flat 09',25000,11,0,0,0,0,30,NULL,2),(3472,0,1678027273,0,'Castle, Basement, Flat 08',50000,11,0,0,0,0,30,NULL,2),(3473,0,1678027273,0,'Cormaya 1',150000,11,0,0,0,0,49,NULL,4),(3474,0,1678027273,0,'Cormaya Flats, Flat 01',25000,11,0,0,0,0,20,NULL,2),(3475,0,1678027273,0,'Cormaya Flats, Flat 02',25000,11,0,0,0,0,20,NULL,2),(3476,0,1678027273,0,'Cormaya Flats, Flat 03',50000,11,0,0,0,0,35,NULL,4),(3477,0,1678027273,0,'Cormaya Flats, Flat 06',25000,11,0,0,0,0,20,NULL,2),(3478,0,1678027273,0,'Cormaya Flats, Flat 05',25000,11,0,0,0,0,20,NULL,2),(3479,0,1678027273,0,'Cormaya Flats, Flat 04',50000,11,0,0,0,0,35,NULL,4),(3480,0,1678027273,0,'Cormaya Flats, Flat 11',100000,11,0,0,0,0,45,NULL,4),(3482,0,1678027273,0,'Cormaya Flats, Flat 13',25000,11,0,0,0,0,30,NULL,4),(3483,0,1678027273,0,'Cormaya Flats, Flat 12',100000,11,0,0,0,0,45,NULL,4),(3485,0,1678027273,0,'Cormaya Flats, Flat 14',25000,11,0,0,0,0,30,NULL,4),(3486,0,1678027273,0,'Cormaya 2',300000,11,0,0,0,0,144,NULL,6),(3487,0,1678027273,0,'Cormaya 4',150000,11,0,0,0,0,63,NULL,4),(3488,0,1678027273,0,'Cormaya 3',200000,11,0,0,0,0,72,NULL,4),(3489,0,1678027273,0,'Cormaya 6',200000,11,0,0,0,0,84,NULL,4),(3490,0,1678027273,0,'Cormaya 7',200000,11,0,0,0,0,84,NULL,4),(3491,0,1678027273,0,'Cormaya 8',200000,11,0,0,0,0,106,NULL,4),(3492,0,1678027273,0,'Cormaya 5',300000,11,0,0,0,0,165,NULL,6),(3493,0,1678027273,0,'Castle of the White Dragon',1000000,11,0,0,0,0,888,NULL,38),(3494,0,1678027273,0,'Cormaya 9b',150000,11,0,0,0,0,88,NULL,4),(3495,0,1678027273,0,'Cormaya 9a',80000,11,0,0,0,0,48,NULL,4),(3496,0,1678027273,0,'Cormaya 9d',150000,11,0,0,0,0,88,NULL,4),(3497,0,1678027273,0,'Cormaya 9c',80000,11,0,0,0,0,48,NULL,4),(3498,0,1678027273,0,'Cormaya 10',300000,11,0,0,0,0,144,NULL,6),(3499,0,1678027273,0,'Cormaya 11',150000,11,0,0,0,0,72,NULL,4),(3500,0,1678027273,0,'Edron Flats, Flat 22',50000,11,0,0,0,0,25,NULL,2),(3501,0,1678027273,0,'Magic Academy, Shop',150000,11,0,0,0,0,48,NULL,2),(3502,0,1678027273,0,'Magic Academy, Flat 1',100000,11,0,0,0,0,55,NULL,6),(3503,0,1678027273,0,'Magic Academy, Guild',500000,11,0,0,0,0,401,NULL,28),(3504,0,1678027273,0,'Magic Academy, Flat 2',80000,11,0,0,0,0,53,NULL,4),(3505,0,1678027273,0,'Magic Academy, Flat 3',100000,11,0,0,0,0,53,NULL,2),(3506,0,1678027273,0,'Magic Academy, Flat 4',100000,11,0,0,0,0,50,NULL,4),(3507,0,1678027273,0,'Magic Academy, Flat 5',80000,11,0,0,0,0,53,NULL,2),(3508,0,1678027273,0,'Oskahl I f',100000,10,0,0,0,0,35,NULL,2),(3509,0,1678027273,0,'Oskahl I g',100000,10,0,0,0,0,42,NULL,4),(3510,0,1678027273,0,'Oskahl I h',150000,10,0,0,0,0,74,NULL,6),(3511,0,1678027273,0,'Oskahl I i',80000,10,0,0,0,0,36,NULL,2),(3512,0,1678027273,0,'Oskahl I j',80000,10,0,0,0,0,36,NULL,2),(3513,0,1678027273,0,'Oskahl I b',80000,10,0,0,0,0,30,NULL,2),(3514,0,1678027273,0,'Oskahl I d',100000,10,0,0,0,0,42,NULL,4),(3515,0,1678027273,0,'Oskahl I e',80000,10,0,0,0,0,36,NULL,2),(3516,0,1678027273,0,'Oskahl I c',80000,10,0,0,0,0,36,NULL,2),(3517,0,1678027273,0,'Chameken I',100000,10,0,0,0,0,36,NULL,2),(3518,0,1678027273,0,'Chameken II',80000,10,0,0,0,0,36,NULL,2),(3519,0,1678027273,0,'Charsirakh III',50000,10,0,0,0,0,36,NULL,2),(3520,0,1678027273,0,'Charsirakh II',100000,10,0,0,0,0,49,NULL,4),(3521,0,1678027273,0,'Murkhol I a',80000,10,0,0,0,0,48,NULL,4),(3523,0,1678027273,0,'Murkhol I c',50000,10,0,0,0,0,24,NULL,2),(3524,0,1678027273,0,'Murkhol I b',50000,10,0,0,0,0,24,NULL,2),(3525,0,1678027273,0,'Charsirakh I b',150000,10,0,0,0,0,64,NULL,4),(3526,0,1678027273,0,'Harrah I',250000,10,0,0,0,0,232,NULL,20),(3527,0,1678027273,0,'Thanah I d',200000,10,0,0,0,0,84,NULL,8),(3528,0,1678027273,0,'Thanah I c',200000,10,0,0,0,0,112,NULL,6),(3529,0,1678027273,0,'Thanah I b',150000,10,0,0,0,0,100,NULL,6),(3530,0,1678027273,0,'Thanah I a',25000,10,0,0,0,0,36,NULL,2),(3531,0,1678027273,0,'Othehothep I c',150000,10,0,0,0,0,60,NULL,6),(3532,0,1678027273,0,'Othehothep I d',150000,10,0,0,0,0,84,NULL,8),(3533,0,1678027273,0,'Othehothep I b',100000,10,0,0,0,0,64,NULL,4),(3534,0,1678027273,0,'Othehothep II c',80000,10,0,0,0,0,30,NULL,2),(3535,0,1678027273,0,'Othehothep II d',80000,10,0,0,0,0,35,NULL,2),(3536,0,1678027273,0,'Othehothep II e',150000,10,0,0,0,0,48,NULL,4),(3537,0,1678027273,0,'Othehothep II f',100000,10,0,0,0,0,56,NULL,4),(3538,0,1678027273,0,'Othehothep II b',150000,10,0,0,0,0,81,NULL,6),(3539,0,1678027273,0,'Othehothep II a',25000,10,0,0,0,0,25,NULL,2),(3540,0,1678027273,0,'Mothrem I',80000,10,0,0,0,0,49,NULL,4),(3541,0,1678027273,0,'Arakmehn I',100000,10,0,0,0,0,56,NULL,6),(3542,0,1678027273,0,'Arakmehn II',80000,10,0,0,0,0,49,NULL,2),(3543,0,1678027273,0,'Arakmehn III',100000,10,0,0,0,0,49,NULL,4),(3544,0,1678027273,0,'Arakmehn IV',100000,10,0,0,0,0,56,NULL,4),(3545,0,1678027273,0,'Unklath II b',50000,10,0,0,0,0,25,NULL,2),(3546,0,1678027273,0,'Unklath II c',50000,10,0,0,0,0,30,NULL,2),(3547,0,1678027273,0,'Unklath II d',100000,10,0,0,0,0,66,NULL,4),(3548,0,1678027273,0,'Unklath II a',50000,10,0,0,0,0,49,NULL,2),(3549,0,1678027273,0,'Rathal I b',50000,10,0,0,0,0,25,NULL,2),(3550,0,1678027273,0,'Rathal I c',25000,10,0,0,0,0,30,NULL,2),(3551,0,1678027273,0,'Rathal I d',50000,10,0,0,0,0,30,NULL,4),(3552,0,1678027273,0,'Rathal I e',50000,10,0,0,0,0,36,NULL,4),(3553,0,1678027273,0,'Rathal I a',80000,10,0,0,0,0,49,NULL,4),(3554,0,1678027273,0,'Rathal II b',50000,10,0,0,0,0,25,NULL,2),(3555,0,1678027273,0,'Rathal II c',50000,10,0,0,0,0,30,NULL,2),(3556,0,1678027273,0,'Rathal II d',100000,10,0,0,0,0,66,NULL,4),(3557,0,1678027273,0,'Rathal II a',80000,10,0,0,0,0,49,NULL,2),(3558,0,1678027273,0,'Esuph I',50000,10,0,0,0,0,36,NULL,2),(3559,0,1678027273,0,'Esuph II b',100000,10,0,0,0,0,64,NULL,4),(3560,0,1678027273,0,'Esuph II a',25000,10,0,0,0,0,20,NULL,2),(3561,0,1678027273,0,'Esuph III b',100000,10,0,0,0,0,64,NULL,4),(3562,0,1678027273,0,'Esuph III a',25000,10,0,0,0,0,20,NULL,2),(3564,0,1678027273,0,'Esuph IV c',80000,10,0,0,0,0,43,NULL,4),(3565,0,1678027273,0,'Esuph IV d',25000,10,0,0,0,0,38,NULL,2),(3566,0,1678027273,0,'Esuph IV a',25000,10,0,0,0,0,25,NULL,2),(3567,0,1678027273,0,'Horakhal',250000,10,0,0,0,0,332,NULL,28),(3568,0,1678027273,0,'Botham II d',100000,10,0,0,0,0,49,NULL,4),(3569,0,1678027273,0,'Botham II e',100000,10,0,0,0,0,49,NULL,4),(3570,0,1678027273,0,'Botham II f',80000,10,0,0,0,0,49,NULL,4),(3571,0,1678027273,0,'Botham II g',80000,10,0,0,0,0,49,NULL,4),(3572,0,1678027273,0,'Botham II c',100000,10,0,0,0,0,40,NULL,4),(3573,0,1678027273,0,'Botham II b',100000,10,0,0,0,0,60,NULL,4),(3574,0,1678027273,0,'Botham II a',25000,10,0,0,0,0,36,NULL,2),(3575,0,1678027273,0,'Botham III f',150000,10,0,0,0,0,56,NULL,6),(3576,0,1678027273,0,'Botham III h',200000,10,0,0,0,0,113,NULL,6),(3577,0,1678027273,0,'Botham III g',100000,10,0,0,0,0,56,NULL,4),(3578,0,1678027273,0,'Botham III b',50000,10,0,0,0,0,25,NULL,4),(3579,0,1678027273,0,'Botham III c',25000,10,0,0,0,0,30,NULL,2),(3581,0,1678027273,0,'Botham III e',100000,10,0,0,0,0,66,NULL,4),(3582,0,1678027273,0,'Botham III a',80000,10,0,0,0,0,49,NULL,4),(3583,0,1678027273,0,'Botham IV f',100000,10,0,0,0,0,49,NULL,4),(3584,0,1678027273,0,'Botham IV h',100000,10,0,0,0,0,56,NULL,2),(3585,0,1678027273,0,'Botham IV i',150000,10,0,0,0,0,56,NULL,6),(3586,0,1678027273,0,'Botham IV g',100000,10,0,0,0,0,64,NULL,4),(3587,0,1678027273,0,'Botham IV e',100000,10,0,0,0,0,121,NULL,8),(3591,0,1678027273,0,'Botham IV a',100000,10,0,0,0,0,49,NULL,4),(3592,0,1678027273,0,'Ramen Tah',250000,10,0,0,0,0,227,NULL,32),(3593,0,1678027273,0,'Botham I c',150000,10,0,0,0,0,49,NULL,4),(3594,0,1678027273,0,'Botham I e',80000,10,0,0,0,0,49,NULL,4),(3595,0,1678027273,0,'Botham I d',150000,10,0,0,0,0,98,NULL,6),(3596,0,1678027273,0,'Botham I b',150000,10,0,0,0,0,100,NULL,6),(3597,0,1678027273,0,'Botham I a',50000,10,0,0,0,0,40,NULL,2),(3598,0,1678027273,0,'Charsirakh I a',25000,10,0,0,0,0,20,NULL,2),(3599,0,1678027273,0,'Low Waters Observatory',400000,10,0,0,0,0,743,NULL,10),(3600,0,1678027273,0,'Oskahl I a',150000,10,0,0,0,0,64,NULL,4),(3601,0,1678027273,0,'Othehothep I a',25000,10,0,0,0,0,20,NULL,2),(3602,0,1678027273,0,'Othehothep III a',25000,10,0,0,0,0,20,NULL,2),(3603,0,1678027273,0,'Othehothep III b',80000,10,0,0,0,0,64,NULL,4),(3604,0,1678027273,0,'Othehothep III c',80000,10,0,0,0,0,30,NULL,4),(3605,0,1678027273,0,'Othehothep III d',80000,10,0,0,0,0,42,NULL,2),(3606,0,1678027273,0,'Othehothep III e',50000,10,0,0,0,0,35,NULL,2),(3607,0,1678027273,0,'Othehothep III f',50000,10,0,0,0,0,37,NULL,2),(3608,0,1678027273,0,'Unklath I f',100000,10,0,0,0,0,49,NULL,4),(3609,0,1678027273,0,'Unklath I g',100000,10,0,0,0,0,56,NULL,2),(3610,0,1678027273,0,'Unklath I d',150000,10,0,0,0,0,56,NULL,6),(3611,0,1678027273,0,'Unklath I e',150000,10,0,0,0,0,64,NULL,4),(3612,0,1678027273,0,'Unklath I b',100000,10,0,0,0,0,55,NULL,4),(3613,0,1678027273,0,'Unklath I c',100000,10,0,0,0,0,66,NULL,4),(3614,0,1678027273,0,'Unklath I a',100000,10,0,0,0,0,49,NULL,4),(3615,0,1678027273,0,'Thanah II a',25000,10,0,0,0,0,36,NULL,2),(3616,0,1678027273,0,'Thanah II b',50000,10,0,0,0,0,20,NULL,2),(3617,0,1678027273,0,'Thanah II d',50000,10,0,0,0,0,20,NULL,2),(3618,0,1678027273,0,'Thanah II e',25000,10,0,0,0,0,16,NULL,2),(3619,0,1678027273,0,'Thanah II c',25000,10,0,0,0,0,24,NULL,2),(3620,0,1678027273,0,'Thanah II f',150000,10,0,0,0,0,86,NULL,6),(3621,0,1678027273,0,'Thanah II g',100000,10,0,0,0,0,51,NULL,4),(3622,0,1678027273,0,'Thanah II h',100000,10,0,0,0,0,55,NULL,4),(3623,0,1678027273,0,'Thrarhor I a (Shop)',50000,10,0,0,0,0,32,NULL,2),(3624,0,1678027273,0,'Thrarhor I c (Shop)',50000,10,0,0,0,0,32,NULL,2),(3625,0,1678027273,0,'Thrarhor I d (Shop)',80000,10,0,0,0,0,32,NULL,2),(3626,0,1678027273,0,'Thrarhor I b (Shop)',50000,10,0,0,0,0,28,NULL,2),(3627,0,1678027273,0,'Uthemath I a',25000,10,0,0,0,0,20,NULL,2),(3628,0,1678027273,0,'Uthemath I b',50000,10,0,0,0,0,36,NULL,2),(3629,0,1678027273,0,'Uthemath I c',80000,10,0,0,0,0,45,NULL,4),(3630,0,1678027273,0,'Uthemath I d',80000,10,0,0,0,0,30,NULL,2),(3631,0,1678027273,0,'Uthemath I e',80000,10,0,0,0,0,35,NULL,4),(3632,0,1678027273,0,'Uthemath I f',150000,10,0,0,0,0,104,NULL,6),(3633,0,1678027273,0,'Uthemath II',250000,10,0,0,0,0,170,NULL,16),(3634,0,1678027273,0,'Marketplace 1',400000,22,0,0,0,0,137,NULL,2),(3635,0,1678027273,0,'Marketplace 2',400000,22,0,0,0,0,148,NULL,4),(3636,0,1678027273,0,'Quay 1',200000,22,0,0,0,0,124,NULL,4),(3637,0,1678027273,0,'Quay 2',200000,22,0,0,0,0,185,NULL,6),(3638,0,1678027273,0,'Halls of Sun and Sea',1000000,22,0,0,0,0,536,NULL,18),(3639,0,1678027273,0,'Palace Vicinity',200000,22,0,0,0,0,198,NULL,4),(3640,0,1678027273,0,'Wave Tower',400000,22,0,0,0,0,341,NULL,8),(3641,0,1678027273,0,'Old Sanctuary of God King Qjell',300000,18,0,0,0,0,701,NULL,12),(3642,0,1678027273,0,'Old Heritage Estate',600000,20,0,0,0,0,435,NULL,14),(3643,0,1678027273,0,'Rathleton Plaza 4',400000,20,0,0,0,0,200,NULL,4),(3644,0,1678027273,0,'Rathleton Plaza 3',400000,20,0,0,0,0,224,NULL,6),(3645,0,1678027273,0,'Rathleton Plaza 2',400000,20,0,0,0,0,112,NULL,4),(3646,0,1678027273,0,'Rathleton Plaza 1',300000,20,0,0,0,0,120,NULL,4),(3647,0,1678027273,0,'Antimony Lane 2',400000,20,0,0,0,0,196,NULL,6),(3648,0,1678027273,0,'Antimony Lane 1',400000,20,0,0,0,0,265,NULL,10),(3649,0,1678027273,0,'Wallside Residence',400000,20,0,0,0,0,264,NULL,8),(3650,0,1678027273,0,'Wallside Lane 1',800000,20,0,0,0,0,286,NULL,8),(3651,0,1678027273,0,'Wallside Lane 2',600000,20,0,0,0,0,312,NULL,8),(3652,0,1678027273,0,'Vanward Flats B',400000,20,0,0,0,0,243,NULL,8),(3653,0,1678027273,0,'Vanward Flats A',400000,20,0,0,0,0,276,NULL,8),(3654,0,1678027273,0,'Bronze Brothers Bastion',5000000,20,0,0,0,0,1230,NULL,30),(3655,0,1678027273,0,'Cistern Ave',300000,20,0,0,0,0,156,NULL,4),(3656,0,1678027273,0,'Antimony Lane 4',400000,20,0,0,0,0,218,NULL,6),(3657,0,1678027273,0,'Antimony Lane 3',400000,20,0,0,0,0,140,NULL,6),(3658,0,1678027273,0,'Rathleton Hills Residence',400000,20,0,0,0,0,252,NULL,6),(3659,0,1678027273,0,'Rathleton Hills Estate',1000000,20,0,0,0,0,709,NULL,26),(3660,0,1678027273,0,'Lion\'s Head Reef',400000,25,0,0,0,0,191,NULL,0),(3661,0,1678027273,0,'Shadow Caves 1',50000,5,0,0,0,0,45,NULL,4),(3662,0,1678027273,0,'Shadow Caves 2',50000,5,0,0,0,0,54,NULL,4),(3663,0,1678027273,0,'Shadow Caves 3',100000,5,0,0,0,0,80,NULL,4),(3664,0,1678027273,0,'Shadow Caves 4',100000,5,0,0,0,0,80,NULL,4),(3665,0,1678027273,0,'Shadow Caves 5',100000,5,0,0,0,0,90,NULL,4),(3666,0,1678027273,0,'Shadow Caves 6',100000,5,0,0,0,0,90,NULL,4),(3667,0,1678027273,0,'Northport Clanhall',250000,6,0,0,0,0,306,NULL,20),(3668,0,1678027273,0,'The Treehouse',250000,15,0,0,0,0,1067,NULL,46),(3669,0,1678027273,0,'Frost Manor',500000,16,0,0,0,0,743,NULL,48),(3670,0,1678027273,0,'Hare\'s Den',150000,7,0,0,0,0,306,NULL,8),(3671,0,1678027273,0,'Lost Cavern',200000,7,0,0,0,0,806,NULL,14),(3673,0,1678027273,0,'Caveman Shelter',150000,12,0,0,0,0,146,NULL,8),(3674,0,1678027273,0,'Eastern House of Tranquility',200000,12,0,0,0,0,419,NULL,10),(3675,0,1678027273,0,'Lakeside Mansion',300000,16,0,0,0,0,218,NULL,0),(3676,0,1678027273,0,'Pilchard Bin 1',80000,16,0,0,0,0,30,NULL,4),(3677,0,1678027273,0,'Pilchard Bin 2',50000,16,0,0,0,0,24,NULL,4),(3678,0,1678027273,0,'Pilchard Bin 3',50000,16,0,0,0,0,24,NULL,2),(3679,0,1678027273,0,'Pilchard Bin 4',50000,16,0,0,0,0,24,NULL,2),(3680,0,1678027273,0,'Pilchard Bin 5',80000,16,0,0,0,0,24,NULL,4),(3681,0,1678027273,0,'Pilchard Bin 6',25000,16,0,0,0,0,20,NULL,2),(3682,0,1678027273,0,'Pilchard Bin 7',25000,16,0,0,0,0,20,NULL,2),(3683,0,1678027273,0,'Pilchard Bin 8',25000,16,0,0,0,0,20,NULL,4),(3684,0,1678027273,0,'Pilchard Bin 9',50000,16,0,0,0,0,20,NULL,2),(3685,0,1678027273,0,'Pilchard Bin 10',0,16,0,0,0,0,20,NULL,2),(3686,0,1678027273,0,'Mammoth House',300000,16,0,0,0,0,310,NULL,12);
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
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `account_name` varchar(50) NOT NULL,
  `transaction_id` varchar(60) NOT NULL,
  `transaction_type` varchar(15) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `unity_value` float DEFAULT NULL,
  `coins_quantity` int DEFAULT NULL,
  `total_value` float DEFAULT NULL,
  `fee_percentage` float DEFAULT NULL,
  `status` varchar(15) NOT NULL,
  `created_date` bigint NOT NULL,
  `approved_date` bigint DEFAULT NULL,
  `account_email` varchar(55) DEFAULT NULL,
  `payment_currency` varchar(3) DEFAULT NULL,
  `payment_company` varchar(45) DEFAULT NULL,
  `coins_paid_date` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id_UNIQUE` (`transaction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (72,51,'SoulsTom','56105611066','pix','pix coin test2 - 1 coin',0.1,1,0.1,0.99,'approved',1679634275,1679634330,'manthovaniusa@gmail.com',NULL,NULL,NULL),(73,51,'SoulsTom','56077228593','pix','teste pix 6 - 1 coin',0.18,1,0.18,0.99,'approved',1679635150,1679635177,'manthovaniusa@gmail.com',NULL,NULL,NULL),(74,51,'SoulsTom','56084491647','pix','10 coins pack',13,10,13,0.99,'approved',1679668110,1679668141,'manthovaniusa@gmail.com',NULL,NULL,NULL),(75,55,'DevTest','56089154819','pix','pix coin test2 - 1 coin',0.1,1,0.1,0.99,'approved',1679674914,1679674949,'cauepani06@gmail.com',NULL,NULL,NULL),(98,53,'garry','98','creditCard','teste 1 creditCard - 10 coins',1,10,1,6.2,'approved',1679728587,NULL,'garryboinaverde@gmail.com','BRL','Stripes',NULL),(99,53,'garry','99','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,4.5,'approved',1679731526,1679731526,'garryboinaverde@gmail.com','BRL','Stripes',NULL),(103,53,'garry','100','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,4.5,'approved',1679731999,1679731999,'garryboinaverde@gmail.com','BRL','Stripes',NULL),(105,53,'garry','104','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,4.5,'approved',1679732185,1679732185,'garryboinaverde@gmail.com','BRL','Stripes',NULL),(107,53,'garry','106','creditCard','teste 1 creditCard - 10 coins',1,10,1,4.5,'approved',1679732817,1679732817,'garryboinaverde@gmail.com','BRL','Stripes',1679732852),(114,53,'garry','108','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,4.5,'approved',1679733396,1679733396,'garryboinaverde@gmail.com','BRL','Stripes',1679733661),(116,53,'garry','115','creditCard','teste 1 creditCard - 10 coins',1,10,1,4.5,'approved',1679733849,1679733849,'garryboinaverde@gmail.com','BRL','Stripes',1679733927),(117,53,'garry','117','creditCard','10 coins pack',13,10,13,4.5,'approved',1679734227,1679734227,'garryboinaverde@gmail.com','BRL','Stripes',1679734347),(118,53,'garry','118','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,5,'approved',1679787494,1679787494,'garryboinaverde@gmail.com','BRL','Stripes',1679787511),(119,53,'garry','56170995781','pix','10 coins pack',12,10,12,0.99,'pending_payment',1679876272,NULL,'garryboinaverde@gmail.com','BRL','Mercado Pago',NULL),(120,53,'garry','0HF32425CJ274961U','paypal','10 coins pack',15,10,15,7,'approved',1679883678,1679883678,'garryboinaverde@gmail.com',NULL,'Paypal',NULL),(121,53,'garry','4SX72131HT760494L','paypal','10 coins pack',15,10,15,7,'approved',1679883765,1679883765,'garryboinaverde@gmail.com',NULL,'Paypal',1679883782),(122,53,'garry','1YU39254ST8599726','paypal','10 coins pack',15,10,15,7,'approved',1679883968,1679883968,'garryboinaverde@gmail.com',NULL,'Paypal',1679883983),(123,53,'garry','9WW39220VH149623X','paypal','10 coins pack',15,10,15,7,'approved',1679884133,1679884133,'garryboinaverde@gmail.com',NULL,'Paypal',1679884153),(124,53,'garry','6R706631CG0691728','paypal','10 coins pack',15,10,15,7,'approved',1679884214,1679884214,'garryboinaverde@gmail.com',NULL,'Paypal',1679884228),(125,53,'garry','59F60908W1599010B','paypal','10 coins pack',15,10,15,7,'approved',1679884432,1679884432,'garryboinaverde@gmail.com',NULL,'Paypal',1679884471),(126,53,'garry','4RS66290ES2998948','paypal','10 coins pack',15,10,15,7,'approved',1679884519,1679884519,'garryboinaverde@gmail.com',NULL,'Paypal',1679884536),(127,53,'garry','8W0712409S406174A','paypal','10 coins pack',15,10,15,7,'approved',1679884583,1679884583,'garryboinaverde@gmail.com',NULL,'Paypal',1679884598),(128,53,'garry','1ST61426JF242664P','paypal','10 coins pack',15,10,15,7,'approved',1679884764,1679884764,'garryboinaverde@gmail.com',NULL,'Paypal',1679884780),(129,53,'garry','1XM908940R816371R','paypal','1200 coins pack',1171,1200,1171,7,'approved',1679884812,1679884812,'garryboinaverde@gmail.com',NULL,'Paypal',1679884834),(130,53,'garry','56174189149','pix','pix coin test2 - 1 coin',0.1,1,0.1,0.99,'pending_payment',1679884936,NULL,'garryboinaverde@gmail.com','BRL','Mercado Pago',NULL),(131,53,'garry','56174280775','pix','10 coins pack',12,10,12,0.99,'pending_payment',1679885251,NULL,'garryboinaverde@gmail.com','BRL','Mercado Pago',NULL),(132,53,'garry','56174300319','pix','teste pix 3 - 1 coin',0.15,1,0.15,0.99,'pending_payment',1679885271,NULL,'garryboinaverde@gmail.com','BRL','Mercado Pago',NULL),(133,53,'garry','56174339647','pix','teste pix 4 - 1 coin',0.16,1,0.16,0.99,'approved',1679885640,1679885724,'garryboinaverde@gmail.com','BRL','Mercado Pago',1679885659),(134,53,'garry','134','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,5,'approved',1679885685,1679885685,'garryboinaverde@gmail.com','BRL','Stripes',1679885705),(135,53,'garry','135','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,5,'approved',1679886009,1679886009,'garryboinaverde@gmail.com','BRL','Stripes',1679886033),(136,53,'garry','5UC85419KP987625P','paypal','10 coins pack',15,10,15,7,'approved',1679886245,1679886245,'garryboinaverde@gmail.com',NULL,'Paypal',1679886267),(137,53,'garry','10N19237WS644193S','paypal','10 coins pack',15,10,15,7,'approved',1679886302,1679886302,'garryboinaverde@gmail.com',NULL,'Paypal',1679886318),(138,53,'garry','24D13895T37300139','paypal','10 coins pack',15,10,15,7,'approved',1679886939,1679886939,'garryboinaverde@gmail.com',NULL,'Paypal',1679886958),(139,53,'garry','5FY21629RC698463P','paypal','10 coins pack',15,10,15,7,'approved',1679886980,1679886980,'garryboinaverde@gmail.com',NULL,'Paypal',1679887008),(140,53,'garry','140','creditCard','teste 2 creditCard - 10 coins',0.5,10,0.5,5,'approved',1679887035,1679887035,'garryboinaverde@gmail.com','BRL','Stripes',1679887052),(141,53,'garry','56204194198','pix','teste pix 5 - 1 coin',0.17,1,0.17,0.99,'approved',1679887070,1679887210,'garryboinaverde@gmail.com','BRL','Mercado Pago',1679887144),(142,51,'SoulsTom','56204257892','pix','teste pix 6 - 1 coin',0.18,1,0.18,0.99,'approved',1679887737,1679887850,'manthovaniusa@gmail.com','BRL','Mercado Pago',1679887783);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
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
INSERT INTO `player_bosstiary` VALUES (37,0,0,1),(4,0,0,1),(40,0,0,1),(43,0,0,1),(3,0,0,1),(5,0,0,1),(6,0,0,1),(45,0,0,1),(25,0,0,1),(38,0,0,1),(46,0,0,1),(44,0,0,1),(47,0,0,1),(53,0,0,1),(52,0,0,1),(56,0,0,1),(59,0,0,1),(61,0,0,1),(60,0,0,1),(54,0,0,1),(55,0,0,1),(58,0,0,1),(62,0,0,1),(63,0,0,1),(57,0,0,1),(51,0,0,1);
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
INSERT INTO `player_charms` VALUES (59,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(51,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(52,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(58,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(57,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(61,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(56,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(53,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(60,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(54,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(55,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(62,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0',''),(63,'0',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'0','0','');
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
INSERT INTO `player_deaths` VALUES (61,1679497484,37,'Tobias',1,'Tobias',1,1,0),(61,1679497688,36,'Tobias',1,'Knighta',1,1,0),(56,1679497715,289,'Orshabaal',0,'Orshabaal',0,0,0),(53,1679497730,260,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497741,36,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497745,35,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497749,34,'Orshabaal',0,'a demon',0,0,0),(61,1679497755,34,'a demon',0,'Orshabaal',0,0,0),(61,1679497760,33,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497765,32,'a demon',0,'Orshabaal',0,0,0),(61,1679497774,31,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497779,30,'Orshabaal',0,'a demon',0,0,0),(61,1679497783,30,'Orshabaal',0,'a demon',0,0,0),(61,1679497788,29,'a demon',0,'a demon',0,0,0),(61,1679497792,28,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497795,27,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497798,26,'Orshabaal',0,'Orshabaal',0,0,0),(61,1679497895,26,'a demon',0,'a demon',0,0,0);
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
  `attributes` blob,
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
INSERT INTO `player_items` VALUES (53,3,101,2853,1,_binary '$&\0\0\0�'),(53,4,102,3561,1,''),(53,5,103,21401,1,''),(53,6,104,3319,1,''),(53,11,105,23396,1,_binary '$'),(53,105,106,14758,1,''),(52,3,101,2853,1,_binary '$&\0\0\0�'),(52,6,102,3291,1,''),(52,11,103,23396,1,''),(52,101,104,3585,1,_binary ''),(52,101,105,21401,1,''),(52,101,106,3561,1,''),(56,3,101,2853,1,_binary '&\0\0\0�'),(56,5,102,21401,1,''),(56,6,103,3319,1,''),(56,11,104,23396,1,''),(61,3,101,2853,1,_binary '$\0&\0\0\0�'),(61,4,102,3561,1,''),(61,5,103,3425,1,''),(61,6,104,3274,1,''),(61,11,105,23396,1,''),(61,101,106,5894,3,_binary ''),(54,3,101,2853,1,''),(54,11,102,23396,1,''),(54,101,103,3585,1,_binary ''),(54,101,104,21401,1,''),(54,101,105,3293,1,''),(54,101,106,3270,1,''),(54,101,107,3291,1,''),(54,101,108,3561,1,''),(55,3,101,2853,1,_binary '$&\0\0\0�'),(55,6,102,3270,1,''),(55,11,103,23396,1,''),(55,101,104,21401,1,''),(55,101,105,3561,1,''),(62,3,101,2853,1,_binary '&\0\0\0�'),(62,4,102,3561,1,''),(62,11,103,23396,1,''),(62,101,104,2853,1,''),(62,101,105,3291,1,''),(62,101,106,3270,1,''),(62,101,107,3293,1,''),(62,101,108,21401,1,''),(62,101,109,3585,1,_binary ''),(62,104,110,3585,1,_binary ''),(62,104,111,21401,1,''),(62,104,112,3293,1,''),(62,104,113,3270,1,''),(62,104,114,3291,1,''),(62,104,115,3561,1,''),(63,1,101,3374,1,''),(63,3,102,2854,1,_binary '$&\0\0\0�'),(63,4,103,3358,1,''),(63,5,104,3430,1,''),(63,6,105,3300,1,''),(63,8,106,3552,1,''),(63,11,107,23396,1,''),(63,102,108,3031,30,_binary ''),(63,102,109,11485,1,_binary ''),(63,102,110,285,1,_binary ''),(63,102,111,11481,1,_binary ''),(63,102,112,3031,100,_binary 'd'),(63,102,113,8031,1,_binary ''),(63,102,114,3031,100,_binary 'd'),(63,102,115,3031,100,_binary 'd'),(63,102,116,3031,100,_binary 'd'),(63,102,117,3453,1,''),(63,102,118,3457,1,''),(63,102,119,3003,1,''),(63,102,120,3725,1,_binary ''),(63,102,121,3031,100,_binary 'd'),(63,102,122,7876,2,_binary ''),(64,3,101,2853,1,NULL),(64,4,102,3561,1,NULL),(64,101,104,3291,1,NULL),(64,101,105,3270,1,NULL),(64,101,106,3293,1,NULL),(64,101,107,21401,1,NULL),(64,101,108,3585,1,NULL),(65,3,101,2853,1,NULL),(65,4,102,3561,1,NULL),(65,101,104,3291,1,NULL),(65,101,105,3270,1,NULL),(65,101,106,3293,1,NULL),(65,101,107,21401,1,NULL),(65,101,108,3585,1,NULL),(57,3,101,2853,1,_binary '$&\0\0\0�'),(57,6,102,3291,1,''),(57,11,103,23396,1,''),(57,101,104,21401,1,''),(57,101,105,3561,1,''),(51,6,101,3270,1,''),(51,11,102,23396,1,_binary '$'),(51,102,103,30180,1,_binary ''),(51,102,104,3360,1,''),(51,102,105,3366,1,''),(51,102,106,3381,1,''),(51,102,107,3419,1,''),(51,102,108,32623,1,_binary ''),(51,102,109,9058,10,_binary '\n'),(51,102,110,14758,1,''),(51,102,111,3032,4,_binary ''),(51,102,112,3385,1,''),(51,102,113,32620,1,''),(51,102,114,14758,1,''),(51,102,115,3035,37,_binary '%'),(51,102,116,19083,53,_binary '5'),(51,102,117,9605,1,'');
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
INSERT INTO `player_kills` VALUES (56,1679497484,61,1),(56,1679497688,61,1);
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
INSERT INTO `player_misc` VALUES (53,_binary '{}'),(52,_binary '{}'),(56,_binary '{}'),(59,_binary '{}'),(61,_binary '{}'),(60,_binary '{}'),(54,_binary '{}'),(55,_binary '{}'),(58,_binary '{}'),(62,_binary '{}'),(63,_binary '{}'),(57,_binary '{}'),(51,_binary '{}');
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
INSERT INTO `player_prey` VALUES (53,0,3,'0',0,1,5,'25','0',1679569517156,_binary 'I	\�s\�i\0|\0`'),(53,1,3,'0',0,2,6,'28','0',1679569517156,_binary 'Hs1Sn\n�'),(53,2,0,'0',0,0,5,'25','0',1679569517157,''),(52,0,3,'0',0,0,7,'31','0',1679421493201,_binary '�$\�L\r\0��\0'),(52,1,3,'0',0,0,4,'22','0',1679421493202,_binary '\�R\0\�\��Fd'),(52,2,0,'0',0,2,3,'19','0',1679421493203,''),(56,0,3,'0',0,1,8,'34','0',1679569366721,_binary 'p)�D\0\�\0v\0;u\0'),(56,1,3,'0',0,2,4,'22','0',1679569366722,_binary '\�\0q\0\�\���\0'),(56,2,0,'0',0,2,9,'37','0',1679569366723,''),(59,0,3,'0',0,1,9,'37','0',1679421395114,_binary '}\0J�(\04�g\0-\0'),(59,1,3,'0',0,2,9,'37','0',1679421395116,_binary '��\r\0,x9\0�u\0'),(59,2,0,'0',0,2,2,'16','0',1679421395117,''),(61,0,3,'0',0,3,2,'16','0',1679569193231,_binary '�\�\�\0\�8\0�q\0'),(61,1,3,'0',0,0,2,'16','0',1679569193232,_binary '\'\0\�\�\0\0Q\��\�,\0'),(61,2,0,'0',0,3,2,'16','0',1679569193233,''),(60,0,3,'0',0,2,6,'28','0',1679663803181,_binary 'l\0|\�\�)\0q\0?=\0{\0'),(60,1,3,'0',0,0,2,'16','0',1679663803182,_binary '!\0\Z\0�\0\'A\0o�\"'),(60,2,0,'0',0,3,8,'34','0',1679663803183,''),(54,0,3,'0',0,1,7,'31','0',1679665954196,_binary '\�\�?\06\�\06\0z'),(54,1,3,'0',0,0,4,'22','0',1679665954197,_binary '�ph\0\��>,\0�'),(54,2,0,'0',0,0,5,'25','0',1679665954198,''),(55,0,3,'0',0,1,3,'19','0',1679666107673,_binary '\r{:\0 U9'),(55,1,3,'0',0,2,5,'25','0',1679666107673,_binary '\��#Nq\0R\0,\0'),(55,2,0,'0',0,3,3,'19','0',1679666107675,''),(58,0,3,'0',0,3,5,'25','0',1679421668534,_binary '\0� *\0SR\0 \�$\0'),(58,1,3,'0',0,1,4,'22','0',1679421668535,''),(58,2,0,'0',0,1,5,'25','0',1679421668535,''),(62,0,3,'0',0,1,9,'37','0',1679741992410,_binary '\�\��/\0M\��'),(62,1,3,'0',0,3,5,'25','0',1679741992412,_binary '�\�>j\0\0�\r'),(62,2,0,'0',0,3,3,'19','0',1679741992412,''),(63,0,3,'0',0,3,8,'34','0',1679748965574,_binary 'G\0\��={\0\�\�\0u\0\�'),(63,1,0,'0',0,3,5,'25','0',1679748965576,''),(63,2,0,'0',0,2,2,'16','0',1679748965576,''),(57,0,3,'0',0,1,8,'34','0',1679455165621,_binary '\�9\0\Z\0\��\\`�'),(57,1,3,'0',0,1,8,'34','0',1679455165622,_binary '\�\0d\0\�N\0\�\0'),(57,2,0,'0',0,1,6,'28','0',1679455165623,''),(51,0,3,'0',0,2,2,'16','0',1679342358821,_binary '!�KQ\Z\0Vd'),(51,1,3,'0',0,2,10,'40','0',1679342358822,_binary '\�\0\�\��q\0\�\0-\0�'),(51,2,0,'0',0,2,4,'22','0',1679342358823,'');
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
INSERT INTO `player_rewards` VALUES (53,101,0,19202,1,_binary '\�	�\0\0'),(53,102,101,3029,8,_binary ''),(53,103,101,3035,13,_binary '\r'),(53,104,101,3046,1,''),(53,105,101,3054,200,_binary '\�\0'),(53,106,101,3055,1,''),(53,107,101,3058,1,_binary ''),(53,108,101,3061,1,_binary ''),(53,109,101,3098,1,''),(53,110,101,5954,1,_binary ''),(53,111,101,6499,1,_binary '');
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
INSERT INTO `player_spells` VALUES (53,'Magic Rope'),(53,'Light'),(53,'Levitate'),(53,'Haste'),(53,'Great Light'),(53,'Find Person'),(53,'Challenge'),(53,'Light Healing'),(53,'Cure Poison'),(53,'Berserk'),(56,'Magic Rope'),(56,'Light'),(56,'Levitate'),(56,'Haste'),(56,'Great Light'),(56,'Find Person'),(56,'Challenge'),(56,'Light Healing'),(56,'Cure Poison'),(56,'Berserk'),(61,'Berserk'),(61,'Cure Poison'),(61,'Light Healing'),(61,'Challenge'),(61,'Find Person'),(61,'Great Light'),(61,'Haste'),(61,'Levitate'),(61,'Light'),(61,'Magic Rope');
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
INSERT INTO `player_storage` VALUES (51,0,1),(51,13413,1),(51,13414,3),(51,14903,0),(51,17101,0),(51,30029,0),(51,30051,1679691356),(51,30058,1),(51,40083,1),(51,40084,1),(51,50031,1),(51,64111,1),(51,64112,1),(51,64114,1),(51,64115,1),(51,64116,1),(51,64117,1),(51,64119,1),(51,64120,1),(51,64125,1),(51,64126,1),(51,64127,1),(51,61305021,2),(51,61305025,1),(51,61305033,2),(51,542171676,1679693550),(51,1041641512,1),(51,2140322841,1),(51,3276582255,10683),(51,3594466839,1679693556),(52,0,0),(52,13413,1),(52,13414,3),(52,14903,0),(52,17101,0),(52,30029,0),(52,30058,1),(52,1041641512,1),(52,2140322841,1),(52,3276582255,14255),(53,0,0),(53,13413,1),(53,13414,3),(53,14903,0),(53,17101,0),(53,20108,2),(53,30029,0),(53,30058,1),(53,51052,0),(53,61305201,1),(53,542171676,1679498091),(53,1041641512,1),(53,2140322841,1),(53,2384563773,1),(53,3276582255,735),(53,3594466839,1679498097),(54,0,0),(54,13413,1),(54,13414,3),(54,14903,0),(54,17101,0),(54,30029,0),(54,30058,1),(54,2140322841,1),(54,3276582255,3),(55,0,0),(55,13413,1),(55,13414,3),(55,14903,0),(55,17101,0),(55,30029,0),(55,30058,1),(55,1041641512,1),(55,2140322841,1),(55,3276582255,39),(56,0,0),(56,13413,1),(56,13414,3),(56,14903,0),(56,17101,0),(56,30029,0),(56,30058,1),(56,51052,0),(56,542171676,0),(56,1041641512,1),(56,2140322841,1),(56,2384563773,1),(56,3276582255,939),(56,3594466839,0),(57,0,1),(57,13413,1),(57,13414,3),(57,14903,0),(57,17101,0),(57,20108,2),(57,30029,0),(57,30058,1),(57,1041641512,1),(57,2140322841,1),(57,3276582255,2471),(61,0,0),(61,13413,1),(61,13414,3),(61,14903,0),(61,17101,0),(61,30029,0),(61,30058,1),(61,51052,0),(61,61305387,1),(61,542171676,1679498359),(61,1041641512,1),(61,2140322841,1),(61,2384563773,1),(61,3276582255,29491),(61,3594466839,0),(62,0,0),(62,13413,1),(62,13414,3),(62,14903,0),(62,17101,0),(62,30029,0),(62,30058,1),(62,2140322841,1),(63,0,1),(63,13413,1),(63,13414,3),(63,14903,0),(63,17101,0),(63,20067,7),(63,20108,4),(63,30029,0),(63,30051,1679683307),(63,38412,5),(63,51052,0),(63,51763,1),(63,64111,1),(63,64112,1),(63,64113,1),(63,64114,1),(63,64115,1),(63,64116,1),(63,64117,1),(63,64122,1),(63,64128,1),(63,61305005,4),(63,61305014,3),(63,61305015,23),(63,61305016,1),(63,61305021,55),(63,61305027,40),(63,61305028,40),(63,61305030,89),(63,61305031,1),(63,61305033,8),(63,61305036,14),(63,61305045,28),(63,61305060,1),(63,61305074,1),(63,61305387,1),(63,542171676,0),(63,703847463,1),(63,1041641512,1),(63,2140322841,1),(63,3276582255,6103),(63,3594466839,0);
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
INSERT INTO `player_taskhunt` VALUES (53,0,2,'0',0,1,'0',0,1679569517157,_binary 'n\0r\0u3\0\n\"\0'),(53,1,2,'0',0,1,'0',0,1679569517158,_binary '�Su\0�v\0\�\0{\�'),(53,2,0,'0',0,1,'0',0,1679569517159,''),(52,0,2,'0',0,1,'0',0,1679421493203,_binary '�\'KG\0,\0\�\0'),(52,1,2,'0',0,1,'0',0,1679421493204,_binary 'x\0x6\0S\0�v�4\0'),(52,2,0,'0',0,1,'0',0,1679421493205,''),(56,0,2,'0',0,1,'0',0,1679569366723,_binary '�\�\0=\Z\0Q\0�U\�'),(56,1,2,'0',0,1,'0',0,1679569366724,_binary 'xH?\0\0,\�$\0'),(56,2,0,'0',0,1,'0',0,1679569366724,''),(59,0,2,'0',0,1,'0',0,1679421395117,_binary '\��\�(\0\�]=\0\�\0�'),(59,1,2,'0',0,1,'0',0,1679421395117,_binary ' �9\0\0�\�+'),(59,2,0,'0',0,1,'0',0,1679421395119,''),(61,0,2,'0',0,1,'0',0,1679569193233,_binary '^\0`i\'\�\0M\�s\0'),(61,1,2,'0',0,1,'0',0,1679569193234,_binary ':\02�\��\03\0:'),(61,2,0,'0',0,1,'0',0,1679569193235,''),(60,0,2,'0',0,1,'0',0,1679663803183,_binary 'v\0 \�,|\0E\0/U'),(60,1,2,'0',0,1,'0',0,1679663803184,_binary '�h\0�\0F\0/\�'),(60,2,0,'0',0,1,'0',0,1679663803185,''),(54,0,2,'0',0,1,'0',0,1679665954198,_binary '\� �F\0	-\0\�'),(54,1,2,'0',0,1,'0',0,1679665954199,_binary '2r\0\0�Q,\0�E\0_'),(54,2,0,'0',0,1,'0',0,1679665954200,''),(55,0,2,'0',0,1,'0',0,1679666107675,_binary '	A\0TxD)5\0'),(55,1,2,'0',0,1,'0',0,1679666107675,_binary 'z\�\\\�\0\�\0�\�'),(55,2,0,'0',0,1,'0',0,1679666107677,''),(58,0,2,'0',0,1,'0',0,1679421668535,_binary '\0e9\0\0�q\�=\0'),(58,1,2,'0',0,1,'0',0,1679421668536,''),(58,2,0,'0',0,1,'0',0,1679421668536,''),(62,0,2,'0',0,1,'0',0,1679741992412,_binary '\0\0�)\�4\0�'),(62,1,2,'0',0,1,'0',0,1679741992413,_binary 'e\0�\�#\�\0\�\0\�\0'),(62,2,0,'0',0,1,'0',0,1679741992414,''),(63,0,2,'0',0,1,'0',0,1679748965576,_binary '\�\�=H\0\�\0$g\0'),(63,1,0,'0',0,1,'0',0,1679748965577,''),(63,2,0,'0',0,1,'0',0,1679748965577,''),(57,0,2,'0',0,1,'0',0,1679455165623,_binary '\n\0\�\0u\0\0�qgd'),(57,1,2,'0',0,1,'0',0,1679455165624,_binary '\��(B\0�4\0'),(57,2,0,'0',0,1,'0',0,1679455165625,''),(51,0,2,'0',0,1,'0',0,1679342358823,_binary '\�\�\0,C\0\r\�\0'),(51,1,2,'0',0,1,'0',0,1679342358824,_binary 'Bn\�\0�G\0\�^'),(51,2,0,'0',0,1,'0',0,1679342358825,'');
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
  `lookbody` int NOT NULL DEFAULT '113',
  `lookfeet` int NOT NULL DEFAULT '115',
  `lookhead` int NOT NULL DEFAULT '95',
  `looklegs` int NOT NULL DEFAULT '39',
  `looktype` int NOT NULL DEFAULT '128',
  `lookaddons` int NOT NULL DEFAULT '0',
  `maglevel` int NOT NULL DEFAULT '0',
  `mana` int NOT NULL DEFAULT '50',
  `manamax` int NOT NULL DEFAULT '50',
  `manaspent` bigint unsigned NOT NULL DEFAULT '0',
  `soul` int unsigned NOT NULL DEFAULT '0',
  `town_id` int NOT NULL DEFAULT '3',
  `posx` int NOT NULL DEFAULT '0',
  `posy` int NOT NULL DEFAULT '0',
  `posz` int NOT NULL DEFAULT '0',
  `conditions` blob,
  `cap` int NOT NULL DEFAULT '410',
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
  `created` int NOT NULL DEFAULT '0',
  `hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment` text,
  `world_id` int NOT NULL DEFAULT '1',
  `createdAt` bigint NOT NULL DEFAULT '0',
  `deletedAt` bigint NOT NULL DEFAULT '0',
  `randomize_mount` smallint NOT NULL DEFAULT '0',
  `boss_points` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_unique` (`name`),
  KEY `account_id` (`account_id`),
  KEY `vocation` (`vocation`),
  CONSTRAINT `players_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (51,'Sacani',6,48,50000,0,250150,250150,2083083347499800,114,114,95,114,131,3,0,250055,250055,0,0,3,32109,32168,7,'',500400,1,1679693514,1427374223,1,0,0,1679693570,0,0,1,1,1,1,1,0,0,1804,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,1,1678807950,0,0,0),(52,'MarcusCrassus',6,49,1,0,155,155,0,113,115,95,39,128,0,0,60,60,0,0,3,32361,31789,7,'',410,1,1679497225,1427374223,1,0,0,1679498268,0,0,1,1,1,1,1,0,0,34611,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,1,1678807954,0,0,0),(53,'Knighta',1,49,10419,4,139503,156355,18839820578400,113,115,95,39,128,0,4,37330,52150,22044,0,6,32370,31790,7,'',260755,1,1679497588,1427374223,1,0,0,1679498258,0,0,0,0,0,0,0,0,0,5195,0,0,43200,-1,2518,10,0,10,0,10,0,202,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,991,1,0,0,100,0,0,NULL,1,1678808306,0,0,0),(54,'Xuxa Baixinha',1,48,1,0,155,155,0,113,115,95,39,136,0,0,60,60,0,0,3,32096,32217,7,'',410,0,1679593954,1427374223,1,0,0,1679593956,0,0,1,1,1,1,1,0,0,2,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,1,NULL,1,1678808877,0,0,0),(55,'picon',1,49,1,0,155,155,0,113,115,95,39,128,0,0,60,60,0,9,3,32097,32219,7,_binary '\0 \0\0����0\�\0\0\0\0\0\0\0\�.\0\0\0\0\0p\0\0\0\0\0�',410,1,1679594610,1427374223,1,0,0,1679594630,0,0,1,1,1,1,1,0,0,45,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,991,1,0,0,100,0,0,NULL,1,1678811285,0,0,0),(56,'Tobias',1,49,285,4,4125,4125,380109162,113,115,95,39,128,0,0,1480,1480,0,0,6,32360,31782,7,'',7075,1,1679497422,1427374223,1,0,0,1679498313,0,0,0,0,0,0,0,0,0,1259,0,0,43200,-1,2520,10,0,10,0,10,0,201,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,991,1,0,0,100,0,0,NULL,1,1678851092,0,0,0),(57,'Guliver',1,51,1,0,155,155,0,95,114,83,76,134,0,0,60,60,0,100,3,32091,32197,7,'',410,1,1679693302,1427374223,1,0,0,1679693482,0,0,0,0,0,0,0,0,0,3362,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,1,1679163203,0,0,0),(61,'Valdemorti',1,51,25,4,440,440,214756,113,115,95,39,128,0,0,170,170,264,0,6,32339,31788,7,'',905,1,1679498353,1427374223,1,0,0,1679526928,0,0,0,0,0,0,0,0,0,53167,0,0,43200,-1,2520,10,0,10,0,10,0,10,6,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,1,1679497091,0,0,0),(62,'TibiaTeste',1,51,1,0,150,150,0,113,115,95,39,128,0,0,50,50,0,0,3,32096,32218,7,'',410,1,1679669992,1427374223,1,0,0,1679669994,0,0,0,0,0,0,0,0,0,2,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,1,1679497117,0,0,0),(63,'Bjorn Tibiamaster',1,50,8,4,185,185,4210,113,115,95,39,128,0,0,85,85,0,100,6,32360,31782,7,_binary '\0 \0\0����\n\0\0\0\0\0\0p\0\0\0\0\0p\0\0\0\0\0�',480,1,1679683304,1806639817,1,0,0,1679683328,0,0,0,0,0,0,0,0,0,27536,0,0,43200,-1,2454,10,0,10,0,16,0,15,0,10,0,17,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,1,0,8,100,0,0,NULL,1,1679676661,0,0,0),(64,'Tunnes',1,55,1,0,150,150,0,113,115,95,39,136,0,0,50,50,0,0,3,0,0,0,NULL,410,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,1,1679684017,0,0,0),(65,'OtherUser',1,55,1,0,150,150,0,113,115,95,39,128,0,0,50,50,0,0,3,0,0,0,NULL,410,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43200,-1,2520,10,0,10,0,10,0,10,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,0,-1,0,0,0,0,0,0,0,0,0,1,0,0,100,0,0,NULL,2,1679684166,0,0,0);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ondelete_players` BEFORE DELETE ON `players` FOR EACH ROW BEGIN
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
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `forum_signature` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `players_comment_players_fk` (`player_id`),
  CONSTRAINT `players_comment_players_fk` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players_comment`
--

LOCK TABLES `players_comment` WRITE;
/*!40000 ALTER TABLE `players_comment` DISABLE KEYS */;
INSERT INTO `players_comment` VALUES (8,54,'isdufhsdiuhfsdf',NULL);
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
  `ip` int DEFAULT NULL,
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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(50) DEFAULT NULL,
  `unity_value` float DEFAULT NULL,
  `coins_quantity` int DEFAULT NULL,
  `payment_type` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'10 coins pack',12,10,'pix'),(2,'30 coins pack',32,30,'pix'),(3,'60 coins pack',62,60,'pix'),(4,'120 coins pack',122,120,'pix'),(5,'250 coins pack',245,250,'pix'),(6,'500 coins pack',480,500,'pix'),(7,'700 coins pack',670,700,'pix'),(8,'1200 coins pack',1150,1200,'pix'),(9,'10 coins pack',14,10,'creditCard'),(10,'30 coins pack',34,30,'creditCard'),(11,'60 coins pack',65,60,'creditCard'),(12,'120 coins pack',128,120,'creditCard'),(13,'250 coins pack',249,250,'creditCard'),(14,'500 coins pack',489,500,'creditCard'),(15,'700 coins pack',677,700,'creditCard'),(16,'1200 coins pack',1170,1200,'creditCard'),(17,'pix coin test',0.5,1,'pix'),(18,'pix coin test2 - 1 coin',0.1,1,'pix'),(19,'teste pix 3 - 1 coin',0.15,1,'pix'),(20,'teste pix 4 - 1 coin',0.16,1,'pix'),(21,'teste pix 5 - 1 coin',0.17,1,'pix'),(22,'teste pix 6 - 1 coin',0.18,1,'pix'),(23,'teste 1 creditCard - 10 coins',1,10,'creditCard'),(24,'teste 2 creditCard - 10 coins',0.5,10,'creditCard');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
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
INSERT INTO `server_config` VALUES ('db_version','28'),('motd_hash','270588929be5485898b3796a2eee346a2b6c6429'),('motd_num','13'),('players_record','529');
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_history`
--

LOCK TABLES `store_history` WRITE;
/*!40000 ALTER TABLE `store_history` DISABLE KEYS */;
INSERT INTO `store_history` VALUES (38,50,0,'Premium Scroll',0,-30,1679594732,0,0);
/*!40000 ALTER TABLE `store_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_server_storage`
--

DROP TABLE IF EXISTS `test_server_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_server_storage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `item_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_server_storage`
--

LOCK TABLES `test_server_storage` WRITE;
/*!40000 ALTER TABLE `test_server_storage` DISABLE KEYS */;
INSERT INTO `test_server_storage` VALUES (1,6,14758),(2,6,14758),(3,6,14758),(4,53,14758),(5,55,14758),(6,55,14758),(7,51,14758),(8,53,14758),(9,51,14758),(10,51,14758),(11,51,14758);
/*!40000 ALTER TABLE `test_server_storage` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `towns`
--

LOCK TABLES `towns` WRITE;
/*!40000 ALTER TABLE `towns` DISABLE KEYS */;
INSERT INTO `towns` VALUES (1,'Dawnport Tutorial',32069,31901,6),(2,'Dawnport',32064,31894,6),(3,'Rookgaard',32097,32219,7),(4,'Island of Destiny',32091,32027,7),(5,'Ab\'Dendriel',32732,31634,7),(6,'Carlin',32360,31782,7),(7,'Kazordoon',32649,31925,11),(8,'Thais',32369,32241,7),(9,'Venore',32957,32076,7),(10,'Ankrahmun',33194,32853,8),(11,'Edron',33217,31814,8),(12,'Farmine',33023,31521,11),(13,'Darashia',33213,32454,1),(14,'Liberty Bay',32317,32826,7),(15,'Port Hope',32594,32745,7),(16,'Svargrond',32212,31132,7),(17,'Yalahar',32787,31276,7),(18,'Gray Beach',33447,31323,9),(19,'Krailos',33657,31665,8),(20,'Rathleton',33594,31899,6),(21,'Roshamuul',33513,32363,6),(22,'Issavi',33921,31477,5),(24,'Cobra Bastion',33397,32651,7),(25,'Bounac',32424,32445,7),(26,'Feyrist',33490,32221,7),(27,'Gnomprona',33517,32856,14),(28,'Marapur',33842,32853,7);
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
  `vocation_name` varchar(25) NOT NULL,
  PRIMARY KEY (`vocation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vocations`
--

LOCK TABLES `vocations` WRITE;
/*!40000 ALTER TABLE `vocations` DISABLE KEYS */;
INSERT INTO `vocations` VALUES (0,'None'),(1,'Sorcerer'),(2,'Druid'),(3,'Paladin'),(4,'Knight'),(5,'Master Sorcerer'),(6,'Elder Druid'),(7,'Royal Paladin'),(8,'Elite Knight');
/*!40000 ALTER TABLE `vocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worlds`
--

DROP TABLE IF EXISTS `worlds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worlds` (
  `id` int unsigned NOT NULL,
  `serverName` varchar(45) NOT NULL,
  `port` int NOT NULL,
  `connectionip` varchar(45) NOT NULL,
  `location` varchar(45) NOT NULL,
  `pvptype` int NOT NULL,
  `createdAt` bigint NOT NULL,
  `deletedAt` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worlds`
--

LOCK TABLES `worlds` WRITE;
/*!40000 ALTER TABLE `worlds` DISABLE KEYS */;
INSERT INTO `worlds` VALUES (1,'Antica',7172,'143.0.20.85','BRA',0,2023,0),(2,'TestServer',7173,'143.0.20.85','BRA',0,2023,0);
/*!40000 ALTER TABLE `worlds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `z_polls`
--

DROP TABLE IF EXISTS `z_polls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `z_polls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `end` int NOT NULL DEFAULT '0',
  `start` int NOT NULL DEFAULT '0',
  `answers` int NOT NULL DEFAULT '0',
  `votes_all` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `z_polls`
--

LOCK TABLES `z_polls` WRITE;
/*!40000 ALTER TABLE `z_polls` DISABLE KEYS */;
/*!40000 ALTER TABLE `z_polls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `z_polls_answers`
--

DROP TABLE IF EXISTS `z_polls_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `z_polls_answers` (
  `poll_id` int NOT NULL,
  `answer_id` int NOT NULL,
  `answer` varchar(255) NOT NULL,
  `votes` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `z_polls_answers`
--

LOCK TABLES `z_polls_answers` WRITE;
/*!40000 ALTER TABLE `z_polls_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `z_polls_answers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-27  0:34:47
