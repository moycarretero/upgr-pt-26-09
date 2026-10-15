-- =========================================================
-- Base de datos SERIES · ejercicios del módulo de BBDD
-- Datos aproximados con fines didácticos (notas y temporadas pueden no estar al día).
-- =========================================================

DROP TABLE IF EXISTS valoraciones;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS plataformas;

CREATE TABLE plataformas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(50) NOT NULL UNIQUE,
  precio_mensual DECIMAL(5,2)
);

CREATE TABLE series (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  titulo         VARCHAR(100) NOT NULL,
  plataforma_id  INT NOT NULL,
  genero         VARCHAR(30),
  anio_estreno   INT,
  temporadas     INT,
  nota           DECIMAL(3,1),
  finalizada     BOOLEAN DEFAULT FALSE,
  pais           VARCHAR(50),
  FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);

CREATE TABLE usuarios (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  ciudad VARCHAR(50),
  edad   INT
);

CREATE TABLE valoraciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  serie_id    INT NOT NULL,
  puntuacion  INT,               -- de 1 a 5
  fecha       DATE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (serie_id) REFERENCES series(id)
);

INSERT INTO plataformas (nombre, precio_mensual) VALUES
  ('Netflix', 13.99),
  ('Max', 9.99),
  ('Prime Video', 4.99),
  ('Disney+', 9.99),
  ('Apple TV+', 9.99),
  ('Movistar Plus+', 10.0),
  ('SkyShowtime', 5.99);

INSERT INTO series (titulo, plataforma_id, genero, anio_estreno, temporadas, nota, finalizada, pais) VALUES
  ('Stranger Things', 1, 'Ciencia ficción', 2016, 5, 8.7, TRUE, 'Estados Unidos'),
  ('La casa de papel', 1, 'Thriller', 2017, 5, 8.2, TRUE, 'España'),
  ('Élite', 1, 'Drama', 2018, 8, 7.2, TRUE, 'España'),
  ('The Crown', 1, 'Drama', 2016, 6, 8.6, TRUE, 'Reino Unido'),
  ('Dark', 1, 'Ciencia ficción', 2017, 3, 8.7, TRUE, 'Alemania'),
  ('Miércoles', 1, 'Comedia', 2022, 2, 8.0, FALSE, 'Estados Unidos'),
  ('El juego del calamar', 1, 'Thriller', 2021, 3, 8.0, TRUE, 'Corea del Sur'),
  ('Los Bridgerton', 1, 'Romance', 2020, 4, 7.3, FALSE, 'Estados Unidos'),
  ('Narcos', 1, 'Drama', 2015, 3, 8.8, TRUE, 'Estados Unidos'),
  ('Black Mirror', 1, 'Ciencia ficción', 2011, 7, 8.7, FALSE, 'Reino Unido'),
  ('Arcane', 1, 'Animación', 2021, 2, 9.0, TRUE, 'Francia'),
  ('Las chicas del cable', 1, 'Drama', 2017, 5, 7.6, TRUE, 'España'),
  ('Juego de Tronos', 2, 'Fantasía', 2011, 8, 9.2, TRUE, 'Estados Unidos'),
  ('Euphoria', 2, 'Drama', 2019, 3, 8.3, FALSE, 'Estados Unidos'),
  ('The Last of Us', 2, 'Drama', 2023, 2, 8.6, FALSE, 'Estados Unidos'),
  ('Succession', 2, 'Drama', 2018, 4, 8.9, TRUE, 'Estados Unidos'),
  ('Chernobyl', 2, 'Drama', 2019, 1, 9.3, TRUE, 'Reino Unido'),
  ('La casa del dragón', 2, 'Fantasía', 2022, 2, 8.3, FALSE, 'Estados Unidos'),
  ('The White Lotus', 2, 'Comedia', 2021, 3, 8.0, FALSE, 'Estados Unidos'),
  ('The Boys', 3, 'Acción', 2019, 5, 8.7, TRUE, 'Estados Unidos'),
  ('Los anillos de poder', 3, 'Fantasía', 2022, 2, 6.9, FALSE, 'Estados Unidos'),
  ('Fallout', 3, 'Ciencia ficción', 2024, 2, 8.3, FALSE, 'Estados Unidos'),
  ('Invencible', 3, 'Animación', 2021, 3, 8.7, FALSE, 'Estados Unidos'),
  ('Reacher', 3, 'Acción', 2022, 3, 8.0, FALSE, 'Estados Unidos'),
  ('The Mandalorian', 4, 'Ciencia ficción', 2019, 3, 8.6, FALSE, 'Estados Unidos'),
  ('Loki', 4, 'Fantasía', 2021, 2, 8.2, TRUE, 'Estados Unidos'),
  ('Andor', 4, 'Ciencia ficción', 2022, 2, 8.6, TRUE, 'Estados Unidos'),
  ('The Bear', 4, 'Comedia', 2022, 4, 8.5, FALSE, 'Estados Unidos'),
  ('Ted Lasso', 5, 'Comedia', 2020, 3, 8.8, FALSE, 'Estados Unidos'),
  ('Separación', 5, 'Thriller', 2022, 2, 8.7, FALSE, 'Estados Unidos'),
  ('The Morning Show', 5, 'Drama', 2019, 4, 8.2, FALSE, 'Estados Unidos'),
  ('Antidisturbios', 6, 'Thriller', 2020, 1, 8.0, TRUE, 'España'),
  ('La peste', 6, 'Drama', 2018, 2, 7.6, TRUE, 'España'),
  ('Arde Madrid', 6, 'Comedia', 2018, 1, 7.4, TRUE, 'España'),
  ('Rapa', 6, 'Thriller', 2022, 3, 7.3, TRUE, 'España');

INSERT INTO usuarios (nombre, ciudad, edad) VALUES
  ('Lucía', 'Madrid', 24),
  ('Marcos', 'Sevilla', 29),
  ('Sara', 'Valencia', 21),
  ('Hugo', 'Madrid', 27),
  ('Nerea', 'Bilbao', 23),
  ('Álex', 'Barcelona', 30),
  ('Paula', 'Badajoz', 22);

INSERT INTO valoraciones (usuario_id, serie_id, puntuacion, fecha) VALUES
  (1, 1, 5, '2025-01-10'),
  (1, 6, 4, '2025-02-02'),
  (1, 14, 5, '2025-03-15'),
  (2, 2, 4, '2025-01-20'),
  (2, 9, 5, '2025-02-11'),
  (2, 20, 5, '2025-04-01'),
  (3, 8, 5, '2025-01-05'),
  (3, 3, 3, '2025-01-28'),
  (3, 29, 4, '2025-05-09'),
  (4, 13, 5, '2025-02-14'),
  (4, 18, 3, '2025-03-03'),
  (4, 22, 4, '2025-06-21'),
  (4, 17, 5, '2025-07-07'),
  (5, 5, 5, '2025-02-25'),
  (5, 30, 5, '2025-03-30'),
  (5, 11, 5, '2025-04-12'),
  (6, 7, 4, '2025-01-17'),
  (6, 28, 4, '2025-05-22'),
  (6, 32, 5, '2025-06-05'),
  (6, 1, 3, '2025-08-19');

