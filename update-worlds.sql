INSERT INTO worlds (id, serverName, location, pvpType, experienceMultiplier, skillMultiplier, magicLvlMultiplier) 
VALUES (1, 'Tibia Test World', 'Test Location', 'open', 1.0, 1.0, 1.0) 
ON DUPLICATE KEY UPDATE serverName='Tibia Test World';

UPDATE players SET world_id = 1 WHERE world_id IS NULL OR world_id = 0;

SELECT * FROM worlds WHERE id = 1;
SELECT COUNT(*) as players_with_world_1 FROM players WHERE world_id = 1;
