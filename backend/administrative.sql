-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2025 at 11:52 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `administrative`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_advisory`
--

CREATE TABLE `admin_advisory` (
  `id` int(11) NOT NULL,
  `advice` text DEFAULT NULL,
  `linked_to` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_cases`
--

CREATE TABLE `admin_cases` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `case_type` varchar(50) DEFAULT NULL,
  `due` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_tasks`
--

CREATE TABLE `admin_tasks` (
  `id` int(11) NOT NULL,
  `task` varchar(255) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `due` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `compliance`
--

CREATE TABLE `compliance` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `due` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT 'Regulatory',
  `status` varchar(50) DEFAULT 'pending',
  `priority` varchar(20) DEFAULT 'medium',
  `riskLevel` varchar(20) DEFAULT 'medium',
  `assignee` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `framework` varchar(255) DEFAULT NULL,
  `evidence` text DEFAULT NULL,
  `nextReview` date DEFAULT NULL,
  `starred` tinyint(1) DEFAULT 0,
  `progress` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `value` decimal(15,2) DEFAULT 0.00,
  `due` date DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `type` varchar(100) DEFAULT 'Service Agreement',
  `status` varchar(50) DEFAULT 'draft',
  `client` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'medium',
  `renewalTerms` varchar(255) DEFAULT NULL,
  `paymentTerms` varchar(255) DEFAULT NULL,
  `starred` tinyint(1) DEFAULT 0,
  `progress` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `amenities` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `photos` text DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `type`, `name`, `capacity`, `amenities`, `price`, `photos`, `description`) VALUES
('bus-1', 'Vehicle', 'Tour Bus #1', 40, 'AC,TV', 200.00, '', 'Comfortable bus for group tours.'),
('hotel-1', 'Hotel', 'Sunrise Hotel', 100, 'Pool,WiFi', 120.00, '', '4-star hotel in city center.'),
('museum', 'Attraction', 'City Museum', 200, 'Guided Tours', 10.00, '', 'Explore local history.'),
('room-a', 'Function Room', 'Conference Room A', 12, 'Projector,Whiteboard', 50.00, '', 'Ideal for meetings.');

-- --------------------------------------------------------

--
-- Table structure for table `facility_reservations`
--

CREATE TABLE `facility_reservations` (
  `id` int(11) NOT NULL,
  `facility_id` varchar(50) NOT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `group_name` varchar(100) DEFAULT NULL,
  `customer` varchar(100) DEFAULT NULL,
  `purpose` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `payment` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
  `status` enum('pending','approved','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facility_reservations`
--

INSERT INTO `facility_reservations` (`id`, `facility_id`, `start`, `end`, `group_name`, `customer`, `purpose`, `price`, `payment`, `payment_status`, `status`, `created_at`) VALUES
(7, 'bus-1', '2025-09-26 05:50:00', '2025-09-27 05:50:00', 'Testt', '', 'Meeting', 4800.00, 0.00, 'pending', 'approved', '2025-09-25 21:50:52');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `department` varchar(50) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `status` varchar(30) DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `department`, `active`, `status`, `created_at`) VALUES
(48, 'patrick', 'patrickdecoy6@gmail.com', '123456789', '7yxTKFhXsv', 'Employee', 'HR', 1, 'active', '2025-09-21 18:15:46');

-- --------------------------------------------------------

--
-- Table structure for table `user_groups`
--

CREATE TABLE `user_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `department` varchar(50) NOT NULL,
  `parent` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visitor_logs`
--

CREATE TABLE `visitor_logs` (
  `id` int(11) NOT NULL,
  `pass_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `host` varchar(100) NOT NULL,
  `purpose` varchar(100) DEFAULT NULL,
  `scheduled_at` datetime NOT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `nda` tinyint(1) DEFAULT 0,
  `status` enum('scheduled','checked-in','checked-out','cancelled') DEFAULT 'scheduled',
  `check_in_at` datetime DEFAULT NULL,
  `check_out_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visitor_logs`
--

INSERT INTO `visitor_logs` (`id`, `pass_id`, `name`, `host`, `purpose`, `scheduled_at`, `id_number`, `nda`, `status`, `check_in_at`, `check_out_at`, `created_at`) VALUES
(1, 'VP-0BMOMT4', 'Test', 'HR Department', 'Delivery', '2025-09-18 17:14:00', '', 0, 'checked-out', NULL, '2025-09-17 10:16:29', '2025-09-17 09:14:31'),
(2, 'VP-JFSA9UB', 'test', 'HR Department', 'Interview', '2025-09-20 20:49:00', '', 0, 'checked-out', NULL, '2025-09-20 12:49:47', '2025-09-20 12:49:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_advisory`
--
ALTER TABLE `admin_advisory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_cases`
--
ALTER TABLE `admin_cases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_tasks`
--
ALTER TABLE `admin_tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `compliance`
--
ALTER TABLE `compliance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `facility_reservations`
--
ALTER TABLE `facility_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facility_id` (`facility_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent` (`parent`);

--
-- Indexes for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_advisory`
--
ALTER TABLE `admin_advisory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_cases`
--
ALTER TABLE `admin_cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `admin_tasks`
--
ALTER TABLE `admin_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `compliance`
--
ALTER TABLE `compliance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facility_reservations`
--
ALTER TABLE `facility_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `user_groups`
--
ALTER TABLE `user_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `facility_reservations`
--
ALTER TABLE `facility_reservations`
  ADD CONSTRAINT `facility_reservations_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`);

--
-- Constraints for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD CONSTRAINT `user_groups_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `user_groups` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
