use `tibiaprojectTestServer`;

UPDATE `player_depotitems`
SET attributes = NULL
WHERE attributes IS NOT NULL;

DELETE FROM `player_bosstiary`
WHERE player_id > 0;

UPDATE `player_taskhunt`
SET `monster_list` = NULL
WHERE `monster_list` IS NOT NULL;

ALTER TABLE `player_depotitems` 
CHANGE COLUMN `attributes` `attributes` BLOB NULL DEFAULT NULL ;

UPDATE `player_depotitems`
SET attributes = NULL
WHERE attributes IS NOT NULL;

ALTER TABLE `player_inboxitems` 
CHANGE COLUMN `attributes` `attributes` BLOB NULL DEFAULT NULL ;

UPDATE `player_inboxitems`
SET attributes = NULL
WHERE attributes IS NOT NULL;

DELETE FROM `player_misc`
WHERE player_id > 0;

DELETE FROM `player_prey`
WHERE player_id > 0;

ALTER TABLE `player_rewards` 
CHANGE COLUMN `attributes` `attributes` BLOB NULL DEFAULT NULL ;

UPDATE `player_rewards`
SET attributes = NULL
WHERE attributes IS NOT NULL;

UPDATE `player_charms`
SET `tracker list` = NULL
WHERE `tracker list` IS NOT NULL;