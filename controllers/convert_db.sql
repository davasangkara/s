-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for convert_db
CREATE DATABASE IF NOT EXISTS `convert_db` /*!40100 DEFAULT CHARACTER SET armscii8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `convert_db`;

-- Dumping structure for table convert_db.admin_logs
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.admin_logs: ~6 rows (approximately)

-- Dumping structure for table convert_db.admin_users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(199) CHARACTER SET armscii8 COLLATE armscii8_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.admin_users: ~3 rows (approximately)
INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `email`, `created_at`) VALUES
	(4, 'Daffa', '$2a$10$zsiLzkdZifNzE.4pUcFuEOmsJaQLkQT4QnyA1XwIpbdSYI0Sc72jq', NULL, '2025-08-09 19:33:05'),
	(5, 'bagusw', '$2a$10$9t1v3a2lCJxqVv15P0NMieHWldxFDaYqEHJxWdOdJmjGgQPYneah6', NULL, '2025-08-09 21:34:19');

-- Dumping structure for table convert_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.categories: ~0 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `slug`, `created_at`) VALUES
	(27, 'Pulsa', 'pulsa', '2025-08-09 22:14:16'),
	(28, 'Paylater', 'paylater', '2025-08-09 22:14:30'),
	(29, 'Voucher F&B', 'voucher-fb', '2025-08-09 22:14:37'),
	(30, 'Voucher Game', 'voucher-game', '2025-08-09 22:14:45');

-- Dumping structure for table convert_db.gestun_providers
CREATE TABLE IF NOT EXISTS `gestun_providers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `rate_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.gestun_providers: ~3 rows (approximately)
INSERT INTO `gestun_providers` (`id`, `name`, `rate_pct`) VALUES
	(5, 'YUP', 10.00),
	(6, 'Kredivo', 10.00),
	(7, 'Credinex', 10.00),
	(8, 'Spaylater ', 10.00),
	(9, 'Honest', 10.00);

-- Dumping structure for table convert_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `price` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.products: ~4 rows (approximately)
INSERT INTO `products` (`id`, `category_id`, `price`, `name`, `rate`, `description`, `is_active`, `created_at`) VALUES
	(23, 27, 910000, 'Axis 1JT', 91.00, NULL, 1, '2025-08-09 22:15:04'),
	(25, 29, 92000, 'Voucher Alfamart 100K', 92.00, NULL, 1, '2025-08-09 22:15:46'),
	(26, 30, 82000, 'Garena Shells 330 S', 82.00, NULL, 1, '2025-08-09 22:16:07'),
	(27, 27, 910000, 'Isat 1JT', 91.00, NULL, 1, '2025-08-09 23:19:38'),
	(28, 27, 920000, 'XL 1JT', 92.00, NULL, 1, '2025-08-09 23:21:14'),
	(29, 27, 905000, 'Tri 1JT', 90.50, NULL, 1, '2025-08-09 23:21:45'),
	(30, 27, 890000, 'Telkomsel 1JT', 89.00, NULL, 1, '2025-08-09 23:22:45'),
	(31, 27, 855000, 'ByU 1JT', 85.50, NULL, 1, '2025-08-09 23:23:23'),
	(32, 27, 845000, 'Smartfren 1JT', 84.50, NULL, 1, '2025-08-09 23:23:44'),
	(33, 30, 41000, 'Garena Shells 165 S', 82.00, NULL, 1, '2025-08-09 23:25:54'),
	(34, 30, 16200, 'Garena Shells 66 S', 81.00, NULL, 1, '2025-08-09 23:26:39'),
	(35, 30, 8100, 'Garena Shells 33 S', 81.00, NULL, 1, '2025-08-09 23:27:23'),
	(36, 30, 82000, 'UP100.000', 82.00, NULL, 1, '2025-08-09 23:28:36'),
	(37, 30, 41000, 'UP50.000', 82.00, NULL, 1, '2025-08-09 23:29:00'),
	(38, 30, 16200, 'UP20.000', 81.00, NULL, 1, '2025-08-09 23:29:18'),
	(39, 30, 8100, 'UP10.000', 81.00, NULL, 1, '2025-08-09 23:29:39'),
	(40, 29, 45000, 'Voucher Alfamart 50K', 90.00, NULL, 1, '2025-08-09 23:31:11'),
	(41, 29, 22000, 'Voucher Alfamart 25K', 85.00, NULL, 1, '2025-08-09 23:31:48'),
	(42, 29, 13000, 'Voucher Alfamart 15', 85.00, NULL, 1, '2025-08-09 23:32:08'),
	(43, 29, 8500, 'Voucher Alfamart 10K', 85.00, NULL, 1, '2025-08-09 23:32:26'),
	(44, 28, 900000, 'Yup 1JT UP', 90.00, NULL, 1, '2025-08-09 23:33:41'),
	(45, 28, 900000, 'Kredivo 1JT UP', 90.00, NULL, 1, '2025-08-09 23:34:15'),
	(46, 28, 900000, 'Credinex 1JT UP', 90.00, NULL, 1, '2025-08-09 23:34:40'),
	(47, 28, 900000, 'Spaylater 1JT UP', 90.00, NULL, 1, '2025-08-09 23:34:56'),
	(48, 28, 900000, 'Akulaku 1JT UP', 90.00, NULL, 1, '2025-08-09 23:35:15');

-- Dumping structure for table convert_db.pulsa_rates
CREATE TABLE IF NOT EXISTS `pulsa_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(120) NOT NULL,
  `rate_pct` decimal(5,2) NOT NULL DEFAULT '80.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.pulsa_rates: ~7 rows (approximately)
INSERT INTO `pulsa_rates` (`id`, `provider`, `rate_pct`) VALUES
	(10, 'Axis 1 JT', 92.00),
	(11, 'Tri', 90.50),
	(12, 'Isat', 91.00),
	(13, 'XL', 92.00),
	(14, 'Telkomsel', 89.00),
	(15, 'ByU', 85.50),
	(16, 'Smartfren', 84.50);

-- Dumping structure for table convert_db.voucher_rates
CREATE TABLE IF NOT EXISTS `voucher_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('FNB','GAME') NOT NULL,
  `brand` varchar(120) NOT NULL,
  `discount_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=armscii8;

-- Dumping data for table convert_db.voucher_rates: ~8 rows (approximately)
INSERT INTO `voucher_rates` (`id`, `type`, `brand`, `discount_pct`) VALUES
	(7, 'FNB', 'Alfamart 100K', 8.00),
	(8, 'FNB', 'Alfamart 50K', 7.00),
	(9, 'FNB', 'Alfamart 25K', 7.00),
	(10, 'FNB', 'Alfamart 15K', 8.00),
	(11, 'FNB', 'Alfamart 10K', 8.00),
	(12, 'GAME', 'Garena Shells 330 S', 13.00),
	(13, 'GAME', 'Garena Shells 330 S', 18.00),
	(14, 'GAME', 'Garena Shells 165 S', 82.00);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
