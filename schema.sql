CREATE DATABASE IF NOT EXISTS online_shop;
USE online_shop;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(30) NOT NULL,
    passwd VARCHAR(30)
);

INSERT INTO users (username, email, passwd)
VALUES ('kox12', 'kox12@mail.com', 'haslo123')
ON DUPLICATE KEY UPDATE username=username;

CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(20) NOT NULL,
    prize FLOAT NOT NULL,
    pieces INT
);

INSERT INTO items (item_name, prize, pieces)
VALUES ('lodowka', 2.50, 3)
ON DUPLICATE KEY UPDATE item_name=item_name;
