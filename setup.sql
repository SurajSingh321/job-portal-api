-- Active: 1777271855803@@localhost@3306@jobportaldb
CREATE DATABASE jobportaldb;
USE jobportaldb;
CREATE TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('company', 'student') DEFAULT 'student'
);

CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    salary INT,
    description TEXT,
    user_id INT
);

CREATE TABLE applications(
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    user_id INT,
    status VARCHAR(50) DEFAULT 'pending'
);

