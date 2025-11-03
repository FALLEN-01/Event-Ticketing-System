-- Event Ticket System - MySQL Database Setup
-- Run this script in MySQL Workbench or command line

-- Create database
CREATE DATABASE IF NOT EXISTS event_tickets 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE event_tickets;

-- Show confirmation
SELECT 'Database created successfully!' AS status;
