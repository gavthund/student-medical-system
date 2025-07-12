-- Student Medical System Database Schema
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_medical_system;
USE student_medical_system;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    medical_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO students (
    student_id, first_name, last_name, date_of_birth, gender, email, phone, 
    address, emergency_contact_name, emergency_contact_phone, medical_conditions, 
    allergies, medications, blood_type
) VALUES 
(
    'STU001', 'John', 'Doe', '2000-05-15', 'Male', 'john.doe@example.com', 
    '555-0123', '123 Main St, City, State 12345', 'Jane Doe', '555-0124', 
    'None', 'Peanuts', 'None', 'O+'
),
(
    'STU002', 'Sarah', 'Smith', '1999-08-22', 'Female', 'sarah.smith@example.com', 
    '555-0125', '456 Oak Ave, City, State 12345', 'Robert Smith', '555-0126', 
    'Asthma', 'None', 'Albuterol Inhaler', 'A+'
),
(
    'STU003', 'Michael', 'Johnson', '2001-03-10', 'Male', 'michael.johnson@example.com', 
    '555-0127', '789 Pine Rd, City, State 12345', 'Lisa Johnson', '555-0128', 
    'Diabetes Type 1', 'Shellfish', 'Insulin', 'B+'
);