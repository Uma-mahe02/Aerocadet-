CREATE DATABASE IF NOT EXISTS ncc_airwing;
USE ncc_airwing;

-- Cadets Table
CREATE TABLE IF NOT EXISTS cadets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cadet_id VARCHAR(50) UNIQUE,
    `rank` VARCHAR(50) DEFAULT 'Cadet',
    contact VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    department VARCHAR(100),
    performance_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (for RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'CTO', 'Student') NOT NULL,
    cadet_ref_id INT,
    FOREIGN KEY (cadet_ref_id) REFERENCES cadets(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Camps Table
CREATE TABLE IF NOT EXISTS camps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Camp Attendance Table
CREATE TABLE IF NOT EXISTS camp_participation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camp_id INT,
    cadet_id INT,
    status ENUM('Registered', 'Attended', 'Completed') DEFAULT 'Registered',
    FOREIGN KEY (camp_id) REFERENCES camps(id) ON DELETE CASCADE,
    FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    role_target ENUM('All', 'CTO', 'Student') DEFAULT 'All',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cadet_id INT,
    type ENUM('NCC ID', 'Aadhar', 'Camp Certificate', 'Achievement') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Table (Generated)
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cadet_id INT,
    type VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    certificate_no VARCHAR(50) UNIQUE NOT NULL,
    FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
