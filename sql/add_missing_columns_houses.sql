-- ============================================================
-- Script: adiciona colunas faltantes na tabela houses
-- Database: projectmain
-- ============================================================
-- Tabela atual tem: id, owner, paid, warnings, name, rent,
--   town_id, bid, bid_end, last_bid, highest_bidder, size, guildid, beds
-- Colunas que o site precisa e estao faltando:
--   world_id  -> vincula a tabela worlds
--   guildhall -> flag que diferencia house (0) de guildhall (1)
--   entryx    -> coordenada X da entrada
--   entryy    -> coordenada Y da entrada
--   entryz    -> coordenada Z (floor) da entrada
-- ============================================================

ALTER TABLE `houses`
    ADD COLUMN `world_id`  INT     NOT NULL DEFAULT 1 AFTER `id`,
    ADD COLUMN `guildhall` TINYINT NOT NULL DEFAULT 0 AFTER `beds`,
    ADD COLUMN `entryx`    INT     NOT NULL DEFAULT 0 AFTER `guildhall`,
    ADD COLUMN `entryy`    INT     NOT NULL DEFAULT 0 AFTER `entryx`,
    ADD COLUMN `entryz`    INT     NOT NULL DEFAULT 0 AFTER `entryy`;
