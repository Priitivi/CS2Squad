-- db/seed.sql

-- Insert mock users
INSERT INTO users (steam_id, username, avatar, region, rank, roles, availability)
VALUES
('123456789', 'PlayerOne', 'https://avatars.steamstatic.com/avatar1.jpg', 'EU', 15000, ARRAY['Entry', 'Support'], ARRAY['Evenings', 'Weekends']),
('987654321', 'PlayerTwo', 'https://avatars.steamstatic.com/avatar2.jpg', 'NA', 14000, ARRAY['AWPer'], ARRAY['Mornings']),
('111222333', 'PlayerThree', 'https://avatars.steamstatic.com/avatar3.jpg', 'EU', 12000, ARRAY['Lurker'], ARRAY['Weekends']);

-- Insert mock teams
INSERT INTO teams (user_steam_id, name, members)
VALUES
('123456789', 'Dream Team', ARRAY['987654321', '111222333']),
('987654321', 'TopFraggers', ARRAY['123456789']);
