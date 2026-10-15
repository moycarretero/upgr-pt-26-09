-- =========================================================
-- Base de datos POKÉMON · ejemplos guiados del módulo de BBDD
-- Compatible con MySQL 8 (y con DB Fiddle eligiendo MySQL 8.0)
-- Las estadísticas son las base stats oficiales; tipo = tipo principal.
-- =========================================================

DROP TABLE IF EXISTS capturas;
DROP TABLE IF EXISTS pokemon;
DROP TABLE IF EXISTS entrenadores;
DROP TABLE IF EXISTS tipos;

CREATE TABLE tipos (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE pokemon (
  id          INT PRIMARY KEY,          -- número de la Pokédex
  nombre      VARCHAR(50) NOT NULL,
  tipo_id     INT NOT NULL,
  generacion  INT NOT NULL,
  altura_m    DECIMAL(4,1),
  peso_kg     DECIMAL(5,1),
  ataque      INT,
  defensa     INT,
  velocidad   INT,
  legendario  BOOLEAN DEFAULT FALSE,
  imagen_url  VARCHAR(255),
  FOREIGN KEY (tipo_id) REFERENCES tipos(id)
);

CREATE TABLE entrenadores (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  ciudad VARCHAR(50),
  edad   INT
);

CREATE TABLE capturas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  entrenador_id INT NOT NULL,
  pokemon_id    INT NOT NULL,
  apodo         VARCHAR(50),
  nivel         INT,
  fecha         DATE,
  FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id),
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
);

INSERT INTO tipos (nombre) VALUES
  ('Planta'),
  ('Fuego'),
  ('Agua'),
  ('Eléctrico'),
  ('Normal'),
  ('Psíquico'),
  ('Lucha'),
  ('Roca'),
  ('Fantasma'),
  ('Tierra'),
  ('Hielo'),
  ('Dragón'),
  ('Hada'),
  ('Siniestro'),
  ('Acero'),
  ('Bicho');

INSERT INTO pokemon (id, nombre, tipo_id, generacion, altura_m, peso_kg, ataque, defensa, velocidad, legendario, imagen_url) VALUES
  (1, 'Bulbasaur', 1, 1, 0.7, 6.9, 49, 49, 45, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'),
  (2, 'Ivysaur', 1, 1, 1.0, 13.0, 62, 63, 60, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png'),
  (3, 'Venusaur', 1, 1, 2.0, 100.0, 82, 83, 80, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png'),
  (4, 'Charmander', 2, 1, 0.6, 8.5, 52, 43, 65, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png'),
  (5, 'Charmeleon', 2, 1, 1.1, 19.0, 64, 58, 80, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png'),
  (6, 'Charizard', 2, 1, 1.7, 90.5, 84, 78, 100, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'),
  (7, 'Squirtle', 3, 1, 0.5, 9.0, 48, 65, 43, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png'),
  (8, 'Wartortle', 3, 1, 1.0, 22.5, 63, 80, 58, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png'),
  (9, 'Blastoise', 3, 1, 1.6, 85.5, 83, 100, 78, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png'),
  (25, 'Pikachu', 4, 1, 0.4, 6.0, 55, 40, 90, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'),
  (26, 'Raichu', 4, 1, 0.8, 30.0, 90, 55, 110, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png'),
  (37, 'Vulpix', 2, 1, 0.6, 9.9, 41, 40, 65, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png'),
  (38, 'Ninetales', 2, 1, 1.1, 19.9, 76, 75, 100, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png'),
  (39, 'Jigglypuff', 5, 1, 0.5, 5.5, 45, 20, 20, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png'),
  (54, 'Psyduck', 3, 1, 0.8, 19.6, 52, 48, 55, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png'),
  (58, 'Growlithe', 2, 1, 0.7, 19.0, 70, 45, 60, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png'),
  (59, 'Arcanine', 2, 1, 1.9, 155.0, 110, 80, 95, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png'),
  (63, 'Abra', 6, 1, 0.9, 19.5, 20, 15, 90, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png'),
  (65, 'Alakazam', 6, 1, 1.5, 48.0, 50, 45, 120, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png'),
  (66, 'Machop', 7, 1, 0.8, 19.5, 80, 50, 35, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png'),
  (74, 'Geodude', 8, 1, 0.4, 20.0, 80, 100, 20, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png'),
  (92, 'Gastly', 9, 1, 1.3, 0.1, 35, 30, 80, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png'),
  (94, 'Gengar', 9, 1, 1.5, 40.5, 65, 60, 110, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png'),
  (95, 'Onix', 8, 1, 8.8, 210.0, 45, 160, 70, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png'),
  (104, 'Cubone', 10, 1, 0.4, 6.5, 50, 95, 35, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png'),
  (129, 'Magikarp', 3, 1, 0.9, 10.0, 10, 55, 80, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png'),
  (130, 'Gyarados', 3, 1, 6.5, 235.0, 125, 79, 81, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png'),
  (131, 'Lapras', 3, 1, 2.5, 220.0, 85, 80, 60, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png'),
  (133, 'Eevee', 5, 1, 0.3, 6.5, 55, 50, 55, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png'),
  (134, 'Vaporeon', 3, 1, 1.0, 29.0, 65, 60, 65, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png'),
  (135, 'Jolteon', 4, 1, 0.8, 24.5, 65, 60, 130, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png'),
  (136, 'Flareon', 2, 1, 0.9, 25.0, 130, 60, 65, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png'),
  (143, 'Snorlax', 5, 1, 2.1, 460.0, 110, 65, 30, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png'),
  (144, 'Articuno', 11, 1, 1.7, 55.4, 85, 100, 85, TRUE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png'),
  (145, 'Zapdos', 4, 1, 1.6, 52.6, 90, 85, 100, TRUE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png'),
  (146, 'Moltres', 2, 1, 2.0, 60.0, 100, 90, 90, TRUE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png'),
  (147, 'Dratini', 12, 1, 1.8, 3.3, 64, 45, 50, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png'),
  (149, 'Dragonite', 12, 1, 2.2, 210.0, 134, 95, 80, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png'),
  (150, 'Mewtwo', 6, 1, 2.0, 122.0, 110, 90, 130, TRUE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png'),
  (151, 'Mew', 6, 1, 0.4, 4.0, 100, 100, 100, TRUE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png'),
  (152, 'Chikorita', 1, 2, 0.9, 6.4, 49, 65, 45, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png'),
  (155, 'Cyndaquil', 2, 2, 0.5, 7.9, 52, 43, 65, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png'),
  (158, 'Totodile', 3, 2, 0.6, 9.5, 65, 64, 43, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png'),
  (175, 'Togepi', 13, 2, 0.3, 1.5, 20, 65, 20, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png'),
  (197, 'Umbreon', 14, 2, 1.0, 27.0, 65, 110, 65, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png'),
  (248, 'Tyranitar', 8, 2, 2.0, 202.0, 134, 110, 61, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png'),
  (249, 'Lugia', 6, 2, 5.2, 216.0, 90, 130, 110, TRUE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png'),
  (445, 'Garchomp', 12, 4, 1.9, 95.0, 130, 95, 102, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png'),
  (448, 'Lucario', 7, 4, 1.2, 54.0, 110, 70, 90, FALSE, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png');

INSERT INTO entrenadores (nombre, ciudad, edad) VALUES
  ('Ash', 'Pueblo Paleta', 10),
  ('Misty', 'Ciudad Celeste', 12),
  ('Brock', 'Ciudad Plateada', 15),
  ('Gary', 'Pueblo Paleta', 11),
  ('Erika', 'Ciudad Azulona', 19),
  ('Sabrina', 'Ciudad Azafrán', 21),
  ('Lance', 'Meseta Añil', 28),
  ('Profesor Oak', 'Pueblo Paleta', 60);

INSERT INTO capturas (entrenador_id, pokemon_id, apodo, nivel, fecha) VALUES
  (1, 25, 'Pika', 35, '2024-01-15'),
  (1, 1, NULL, 22, '2024-02-03'),
  (1, 4, 'Charmy', 30, '2024-02-20'),
  (1, 7, NULL, 18, '2024-03-11'),
  (1, 143, 'Dormilón', 40, '2024-09-30'),
  (1, 448, 'Lucky', 45, '2025-03-08'),
  (2, 54, 'Patito', 20, '2024-01-22'),
  (2, 131, NULL, 33, '2024-06-14'),
  (2, 130, 'Furia', 42, '2024-11-02'),
  (3, 95, 'Rocoso', 38, '2024-01-05'),
  (3, 74, NULL, 16, '2024-04-19'),
  (3, 39, 'Cantarín', 14, '2025-01-27'),
  (4, 133, NULL, 25, '2024-05-07'),
  (4, 9, 'Tortugón', 50, '2024-08-21'),
  (4, 248, NULL, 55, '2025-02-14'),
  (5, 3, 'Florecita', 44, '2024-07-01'),
  (5, 152, NULL, 12, '2025-04-03'),
  (6, 65, NULL, 48, '2024-03-30'),
  (6, 63, 'Teleporte', 15, '2024-10-10'),
  (6, 94, 'Sombra', 46, '2025-05-21'),
  (7, 149, 'Dragonazo', 62, '2024-02-29'),
  (7, 147, NULL, 20, '2024-12-24'),
  (7, 130, 'Rugido', 58, '2025-06-01'),
  (7, 445, NULL, 64, '2025-07-19');

