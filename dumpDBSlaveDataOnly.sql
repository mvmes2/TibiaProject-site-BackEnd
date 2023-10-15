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
-- Dumping data for table `contract_type`
--

LOCK TABLES `contract_type` WRITE;
/*!40000 ALTER TABLE `contract_type` DISABLE KEYS */;
INSERT INTO `contract_type` VALUES (1,'youtube'),(2,'stream'),(3,'instagram'),(4,'youtube + stream'),(5,'youtube + instagram'),(6,'youtube + stream + instagram'),(7,'stream + instagram');
/*!40000 ALTER TABLE `contract_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cupom_type`
--

LOCK TABLES `cupom_type` WRITE;
/*!40000 ALTER TABLE `cupom_type` DISABLE KEYS */;
INSERT INTO `cupom_type` VALUES (1,'coins'),(2,'discount');
/*!40000 ALTER TABLE `cupom_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cupoms`
--

LOCK TABLES `cupoms` WRITE;
/*!40000 ALTER TABLE `cupoms` DISABLE KEYS */;
INSERT INTO `cupoms` VALUES (1,123,1,'TIBIAPAPO',0,0,100,'active'),(2,123,2,'PROJECT',10,0,0,'active');
/*!40000 ALTER TABLE `cupoms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payer_list`
--

LOCK TABLES `payer_list` WRITE;
/*!40000 ALTER TABLE `payer_list` DISABLE KEYS */;
INSERT INTO `payer_list` VALUES ('65189035259','2023-10-15T16:37:41.590Z','{\"value\":12,\"product_name\":\"10 coins pack\",\"coins_quantity\":10,\"product_id\":1,\"name\":\"Marcus\",\"email\":\"mvmes23@gmail.com\",\"order_id\":7,\"account_id\":49}',49,'2023-10-15T16:37:41.590Z',16973878616),('65189769023','2023-10-15T16:54:56.315Z','{\"value\":12,\"product_name\":\"10 coins pack\",\"coins_quantity\":10,\"product_id\":1,\"name\":\"Marcus\",\"email\":\"mvmes23@gmail.com\",\"order_id\":7,\"account_id\":49}',49,'2023-10-15T16:54:56.315Z',16973888963),('65190088331','2023-10-15T17:03:39.604Z','{\"value\":12,\"product_name\":\"10 coins pack\",\"coins_quantity\":10,\"product_id\":1,\"name\":\"Marcus\",\"email\":\"mvmes23@gmail.com\",\"order_id\":10,\"account_id\":49}',49,'2023-10-15T17:03:39.604Z',16973894196),('65355653556','2023-10-15T17:01:17.940Z','{\"value\":12,\"product_name\":\"10 coins pack\",\"coins_quantity\":10,\"product_id\":1,\"name\":\"Marcus\",\"email\":\"mvmes23@gmail.com\",\"order_id\":9,\"account_id\":49}',49,'2023-10-15T17:01:17.940Z',16973892779),('65355776648','2023-10-15T17:04:41.620Z','{\"value\":12,\"product_name\":\"10 coins pack\",\"coins_quantity\":10,\"product_id\":1,\"name\":\"Marcus\",\"email\":\"mvmes23@gmail.com\",\"order_id\":11,\"account_id\":49}',49,'2023-10-15T17:04:41.620Z',16973894816);
/*!40000 ALTER TABLE `payer_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,49,'Marcus','65347979482','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697379846,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(2,49,'Marcus','CHEC_A64BEED6-2887-4108-BEEE-1FA87E9AC69C','creditCard','10 coins pack',10.8,10,10.8,6,'sent',1697380012,1697380014,'mvmes23@gmail.com','BRL','PagSeguro',1697380015,2),(3,49,'Marcus','65185650227','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697383554,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(4,49,'Marcus','65186383191','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697384436,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(5,49,'Marcus','65352786882','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697385308,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(6,49,'Marcus','65353269100','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697385877,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(7,49,'Marcus','65189769023','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697388896,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(8,49,'Marcus','65189035259','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697388991,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(9,49,'Marcus','65355653556','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697389278,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(10,49,'Marcus','65190088331','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697389419,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL),(11,49,'Marcus','65355776648','pix','10 coins pack',12,10,12,0.99,'pending_payment',1697389481,NULL,'mvmes23@gmail.com','BRL','Mercado Pago',NULL,NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `person_type`
--

LOCK TABLES `person_type` WRITE;
/*!40000 ALTER TABLE `person_type` DISABLE KEYS */;
INSERT INTO `person_type` VALUES (1,'PJ'),(2,'PF');
/*!40000 ALTER TABLE `person_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'10 coins pack',12,10,'pix'),(2,'30 coins pack',32,30,'pix'),(3,'60 coins pack',62,60,'pix'),(4,'120 coins pack',122,120,'pix'),(5,'250 coins pack',245,250,'pix'),(6,'500 coins pack',480,500,'pix'),(7,'700 coins pack',670,700,'pix'),(8,'1200 coins pack',1150,1200,'pix'),(9,'10 coins pack',14,10,'creditCard'),(10,'30 coins pack',34,30,'creditCard'),(11,'60 coins pack',65,60,'creditCard'),(12,'120 coins pack',128,120,'creditCard'),(13,'250 coins pack',249,250,'creditCard'),(14,'500 coins pack',489,500,'creditCard'),(15,'700 coins pack',677,700,'creditCard'),(16,'1200 coins pack',1170,1200,'creditCard'),(17,'pix coin test',0.5,1,'pix'),(18,'pix coin test2 - 1 coin',0.1,1,'pix'),(19,'teste pix 3 - 1 coin',0.15,1,'pix'),(20,'teste pix 4 - 1 coin',0.16,1,'pix'),(21,'teste pix 5 - 1 coin',0.17,1,'pix'),(22,'teste pix 6 - 1 coin',0.18,1,'pix'),(23,'teste 1 creditCard - 10 coins',1,10,'creditCard'),(24,'teste CreditCard - 10 coins',0.5,10,'creditCard'),(26,'Silver Founder\'s Pack',200,350,'pix'),(27,'Gold Founder\'s Pack',350,525,'pix'),(28,'Diamond Founder\'s Pack',550,775,'pix'),(29,'Silver Founder\'s Pack',210,350,'creditCard'),(30,'Gold Founder\'s Pack',362,525,'creditCard'),(31,'Diamond Founder\'s Pack',570,775,'creditCard'),(32,'Silver Founder\'s Pack TEST',0.1,1,'pix'),(33,'Silver Founder\'s Pack TEST 2',0.11,1,'pix'),(34,'Silver Founder\'s Pack TEST 3',0.12,1,'pix'),(35,'Silver Founder\'s Pack TEST 4',0.13,1,'pix'),(36,'Silver Founder\'s Pack TEST 5',1,1,'pix'),(37,'Silver Founder\'s Pack TEST 6',5,1,'pix');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `redeem_cupom_storage`
--

LOCK TABLES `redeem_cupom_storage` WRITE;
/*!40000 ALTER TABLE `redeem_cupom_storage` DISABLE KEYS */;
INSERT INTO `redeem_cupom_storage` VALUES (49,2);
/*!40000 ALTER TABLE `redeem_cupom_storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `streamers`
--

LOCK TABLES `streamers` WRITE;
/*!40000 ALTER TABLE `streamers` DISABLE KEYS */;
INSERT INTO `streamers` VALUES (12,'134826318','Nattank','nattank','Nattank','Nattank@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'inactive',12,1),(13,'573373346','bigodezerah','bigodezerah','bigodezerah','bigodezerah@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'active',13,1),(14,'175485842','rhuanzerahh','rhuanzerahh','rhuanzerahh','bigodezerah@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'active',1,1),(15,'172232144','EliasTibianoDoido','eliastibianodoido','EliasTibianoDoido','EliasTibianoDoido@gmail.com',NULL,'11959579097',NULL,NULL,NULL,NULL,NULL,'active',15,1);
/*!40000 ALTER TABLE `streamers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `streamers_live_check_time`
--

LOCK TABLES `streamers_live_check_time` WRITE;
/*!40000 ALTER TABLE `streamers_live_check_time` DISABLE KEYS */;
INSERT INTO `streamers_live_check_time` VALUES (7,'134826318','Nattank','41902648073','@Nattank Crossbow LENDÁRIO! -> ♥ Sorteio diario de 250 tibia coins ❗sorteiodiario ♥ !osiris !arcana !shadow !seal !reidoscoins !tibiabj','2023-10-01T22:44:42Z',NULL),(8,'573373346','bigodezerah','42849294251','replay /rerun !insta !pix !parceria !moedaz !youtube !loja','2023-10-02T01:38:04Z',NULL),(9,'175485842','Rhuanzerahh','41903866185','ShadowIllusion !shadow !blacktalon !baiakera !sealserver !retronia COMPRO/VENDO TIBIA COINS !!! +18','2023-10-02T08:54:01Z',NULL),(10,'172232144','EliasTibianoDoido','41903993609','!Motivo 🤑 HOJE 🤑 Sorteio de 2.000tc - 🛒 Loja On : Farme Pontos e Troca por ❗Ticket','2023-10-02T11:50:10Z',NULL);
/*!40000 ALTER TABLE `streamers_live_check_time` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'Bug','Marcus',49,'mvmes23@gmail.com','Pending Staff Response','\"Resumo: testando tickets\\r\\n\\r\\nReproduzindo o bug: logue em sua conta, vá para tickets, e abra um novo ticket\"',1697382931,NULL,'pt-br',NULL,NULL),(2,'Bug','Marcus',49,'mvmes23@gmail.com','Pending Staff Response','\"Resumo: testando tickets\\r\\n\\r\\nReproduzindo o bug: logue em sua conta, vá para tickets, e abra um novo ticket\"',1697382985,NULL,'pt-br',NULL,NULL),(3,'Bug','Marcus',49,'mvmes23@gmail.com','Pending Staff Response','\"Resumo: testando tickets\\r\\n\\r\\nReproduzindo o bug: logue em sua conta, vá para tickets, e abra um novo ticket\"',1697383017,NULL,'pt-br',NULL,NULL),(4,'Bug','Marcus',49,'mvmes23@gmail.com','Pending Staff Response','\"Resumo:  asdasdsadasd\\r\\n\\r\\nReproduzindo o bug: asdsadsadas\"',1697383154,NULL,'pt-br',NULL,NULL),(5,'Bug','Marcus',49,'mvmes23@gmail.com','Closed','\"Resumo: asdasdas\\r\\n\\r\\nReproduzindo o bug: asdsadsadsa\"',1697383176,NULL,'pt-br',1697383298,'Marcus'),(6,'Streamer','Marcus',49,'mvmes23@gmail.com','Pending Staff Response','\"quero ser streamer pq eu sou top top top!\"',1697383354,NULL,'pt-br',NULL,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tickets_images`
--

LOCK TABLES `tickets_images` WRITE;
/*!40000 ALTER TABLE `tickets_images` DISABLE KEYS */;
INSERT INTO `tickets_images` VALUES (1,4,'1697383154021-417059712-compressed.jpg'),(2,5,'1697383176220-310677137-compressed.png'),(3,5,'1697383176229-530815764-compressed.jpeg'),(4,5,'1697383176230-701370655-compressed.png'),(5,6,'1697383353993-111295513-compressed.jpg');
/*!40000 ALTER TABLE `tickets_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tickets_response`
--

LOCK TABLES `tickets_response` WRITE;
/*!40000 ALTER TABLE `tickets_response` DISABLE KEYS */;
INSERT INTO `tickets_response` VALUES (1,5,'\"asdsadsadsa\"','staff',1697383285,NULL,'Marcus');
/*!40000 ALTER TABLE `tickets_response` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tickets_response_images`
--

LOCK TABLES `tickets_response_images` WRITE;
/*!40000 ALTER TABLE `tickets_response_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets_response_images` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-15 14:35:30
