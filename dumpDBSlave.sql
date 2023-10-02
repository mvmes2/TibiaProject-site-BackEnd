-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tibiaprojectslave
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
-- Current Database: `tibiaprojectslave`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `tibiaprojectslave` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `tibiaprojectslave`;

--
-- Table structure for table `livestreams`
--

DROP TABLE IF EXISTS `livestreams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livestreams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(60) DEFAULT NULL,
  `user_login` varchar(60) DEFAULT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `game_name` varchar(45) DEFAULT NULL,
  `stream_title` varchar(150) DEFAULT NULL,
  `language` varchar(45) DEFAULT NULL,
  `thumbnail_url` varchar(300) DEFAULT NULL,
  `stream_started_at` varchar(30) DEFAULT NULL,
  `stream_ended_at` varchar(30) DEFAULT NULL,
  `stream_id` varchar(60) DEFAULT NULL,
  `viewer_count` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livestreams`
--

LOCK TABLES `livestreams` WRITE;
/*!40000 ALTER TABLE `livestreams` DISABLE KEYS */;
INSERT INTO `livestreams` VALUES (17,'Rhuanzerahh','rhuanzerahh','175485842','Tibia','ShadowIllusion !shadow !blacktalon !baiakera !sealserver !retronia COMPRO/VENDO TIBIA COINS !!! +18','pt','https://static-cdn.jtvnw.net/previews-ttv/live_user_rhuanzerahh-170x120.jpg','2023-10-02T08:54:01Z',NULL,'41903866185',182),(18,'manowartibia','manowartibia','56691069','Tibia','SOE 7.4 ! ! !soe !darkrest !retronia !newvideo !contacto !social !donate !adds !grupowsp','pt','https://static-cdn.jtvnw.net/previews-ttv/live_user_manowartibia-170x120.jpg','2023-10-02T12:00:56Z',NULL,'41904005561',96),(19,'EliasTibianoDoido','eliastibianodoido','172232144','Tibia','🤑 HOJE 🤑 Sorteio de 2.000tc - 🛒 Loja On : Farme Pontos e Troca por ❗Ticket','pt','https://static-cdn.jtvnw.net/previews-ttv/live_user_eliastibianodoido-170x120.jpg','2023-10-02T11:50:10Z',NULL,'41903993609',60);
/*!40000 ALTER TABLE `livestreams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streamers`
--

DROP TABLE IF EXISTS `streamers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streamers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `twitch_user_id` varchar(60) DEFAULT NULL,
  `twitch_user_name` varchar(60) DEFAULT NULL,
  `twitch_user_login` varchar(60) DEFAULT NULL,
  `streamer_name` varchar(60) DEFAULT NULL,
  `email` varchar(60) DEFAULT NULL,
  `referral` varchar(60) DEFAULT NULL,
  `cell_number` varchar(13) DEFAULT NULL,
  `pix` varchar(245) DEFAULT NULL,
  `pix_type` varchar(45) DEFAULT NULL,
  `bank_account_number` varchar(45) DEFAULT NULL,
  `bank_agency_number` varchar(45) DEFAULT NULL,
  `bank_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streamers`
--

LOCK TABLES `streamers` WRITE;
/*!40000 ALTER TABLE `streamers` DISABLE KEYS */;
INSERT INTO `streamers` VALUES (12,'134826318','Nattank','nattank','Nattank','Nattank@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL),(13,'573373346','bigodezerah','bigodezerah','bigodezerah','bigodezerah@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL),(14,'175485842','rhuanzerahh','rhuanzerahh','rhuanzerahh','bigodezerah@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `streamers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streamers_live_check_time`
--

DROP TABLE IF EXISTS `streamers_live_check_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streamers_live_check_time` (
  `id` int NOT NULL AUTO_INCREMENT,
  `streamer_id` int NOT NULL,
  `streamer_twitch_id` varchar(60) NOT NULL,
  `streamer_name` varchar(60) NOT NULL,
  `live_id` varchar(60) NOT NULL,
  `live_title` varchar(145) DEFAULT NULL,
  `live_started_at` varchar(60) NOT NULL,
  `live_ended_at` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streamers_live_check_time`
--

LOCK TABLES `streamers_live_check_time` WRITE;
/*!40000 ALTER TABLE `streamers_live_check_time` DISABLE KEYS */;
INSERT INTO `streamers_live_check_time` VALUES (7,12,'134826318','Nattank','41902648073','@Nattank Crossbow LENDÁRIO! -> ♥ Sorteio diario de 250 tibia coins ❗sorteiodiario ♥ !osiris !arcana !shadow !seal !reidoscoins !tibiabj','2023-10-01T22:44:42Z',NULL),(8,13,'573373346','bigodezerah','42849294251','replay /rerun !insta !pix !parceria !moedaz !youtube !loja','2023-10-02T01:38:04Z',NULL),(9,14,'175485842','Rhuanzerahh','41903866185','ShadowIllusion !shadow !blacktalon !baiakera !sealserver !retronia COMPRO/VENDO TIBIA COINS !!! +18','2023-10-02T08:54:01Z',NULL);
/*!40000 ALTER TABLE `streamers_live_check_time` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-02  9:44:45
