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
-- Table structure for table `contract_type`
--

DROP TABLE IF EXISTS `contract_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_type`
--

LOCK TABLES `contract_type` WRITE;
/*!40000 ALTER TABLE `contract_type` DISABLE KEYS */;
INSERT INTO `contract_type` VALUES (1,'youtube'),(2,'stream'),(3,'instagram'),(4,'youtube + stream'),(5,'youtube + instagram'),(6,'youtube + stream + instagram'),(7,'stream + instagram');
/*!40000 ALTER TABLE `contract_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `contract_type` varchar(125) NOT NULL,
  `contract_value` int NOT NULL,
  `contract_owner_name` varchar(60) NOT NULL,
  `streamer_id` varchar(60) DEFAULT NULL,
  `created_at` bigint NOT NULL,
  `contract_start_at` bigint NOT NULL,
  `contract_signed` int NOT NULL,
  `contract_ended_at` bigint DEFAULT NULL,
  `active` int NOT NULL,
  `contract_doc_url` varchar(120) DEFAULT NULL,
  `contract_paid_date` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
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
  `cupom` varchar(60) DEFAULT NULL,
  `cell_number` varchar(13) DEFAULT NULL,
  `pix_type` varchar(45) DEFAULT NULL,
  `pix_key` varchar(245) DEFAULT NULL,
  `bank_account_number` varchar(45) DEFAULT NULL,
  `bank_agency_number` varchar(45) DEFAULT NULL,
  `bank_name` varchar(45) DEFAULT NULL,
  `streamer_status` varchar(45) NOT NULL DEFAULT 'inactive',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streamers`
--

LOCK TABLES `streamers` WRITE;
/*!40000 ALTER TABLE `streamers` DISABLE KEYS */;
INSERT INTO `streamers` VALUES (12,'134826318','Nattank','nattank','Nattank','Nattank@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'inactive'),(13,'573373346','bigodezerah','bigodezerah','bigodezerah','bigodezerah@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'active'),(14,'175485842','rhuanzerahh','rhuanzerahh','rhuanzerahh','bigodezerah@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'active'),(15,'172232144','EliasTibianoDoido','eliastibianodoido','EliasTibianoDoido','EliasTibianoDoido@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'active');
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
  `streamer_twitch_id` varchar(60) NOT NULL,
  `streamer_name` varchar(60) NOT NULL,
  `live_id` varchar(60) NOT NULL,
  `live_title` varchar(145) DEFAULT NULL,
  `live_started_at` varchar(60) NOT NULL,
  `live_ended_at` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streamers_live_check_time`
--

LOCK TABLES `streamers_live_check_time` WRITE;
/*!40000 ALTER TABLE `streamers_live_check_time` DISABLE KEYS */;
INSERT INTO `streamers_live_check_time` VALUES (7,'134826318','Nattank','41902648073','@Nattank Crossbow LENDÁRIO! -> ♥ Sorteio diario de 250 tibia coins ❗sorteiodiario ♥ !osiris !arcana !shadow !seal !reidoscoins !tibiabj','2023-10-01T22:44:42Z',NULL),(8,'573373346','bigodezerah','42849294251','replay /rerun !insta !pix !parceria !moedaz !youtube !loja','2023-10-02T01:38:04Z',NULL),(9,'175485842','Rhuanzerahh','41903866185','ShadowIllusion !shadow !blacktalon !baiakera !sealserver !retronia COMPRO/VENDO TIBIA COINS !!! +18','2023-10-02T08:54:01Z',NULL),(10,'172232144','EliasTibianoDoido','41903993609','!Motivo 🤑 HOJE 🤑 Sorteio de 2.000tc - 🛒 Loja On : Farme Pontos e Troca por ❗Ticket','2023-10-02T11:50:10Z',NULL);
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

-- Dump completed on 2023-10-09 12:34:31
