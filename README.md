# Student Medical System

## Overview
A comprehensive web-based student medical management system built with PHP, JavaScript, and Bootstrap.

## Features
- Student registration and management
- Medical records tracking
- Emergency contact information
- Responsive Bootstrap UI
- RESTful API endpoints

## File Structure
```
student-medical-system/
├── index.html              # Main application interface
├── config/
│   └── database.php        # Database connection configuration
├── api/
│   └── students.php        # Student API endpoints
├── css/
│   └── custom.css          # Custom styles
├── js/
│   └── main.js             # Application JavaScript
└── sql/
    └── schema.sql          # Database schema and sample data
```

## Setup Instructions

### 1. Database Setup
1. Create a MySQL database named `student_medical_system`
2. Import the schema: `mysql -u root -p student_medical_system < sql/schema.sql`
3. Update database credentials in `config/database.php` if needed

### 2. Web Server Setup
1. Place files in your web server directory (e.g., `/var/www/html/`)
2. Ensure PHP 7.4+ and MySQL are installed
3. Make sure PHP PDO MySQL extension is enabled

### 3. Access the Application
1. Open your browser and navigate to the application URL
2. The system will work in demo mode if database is not available

## Database Schema

The system uses a single `students` table with the following fields:
- Student identification (ID, name, email)
- Personal information (DOB, gender, phone, address)
- Emergency contacts
- Medical information (conditions, allergies, medications, blood type)
- Timestamps for record tracking

## API Endpoints

- `GET /api/students.php` - List all students
- `GET /api/students.php?id={id}` - Get specific student
- `POST /api/students.php` - Create new student
- `PUT /api/students.php` - Update student
- `DELETE /api/students.php?id={id}` - Delete student

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: PHP 7.4+, PDO
- **Database**: MySQL 8.0+
- **Icons**: Font Awesome 6

## Security Features
- Input validation and sanitization
- SQL injection prevention with prepared statements
- XSS protection with HTML escaping
- CORS headers for API access

## Demo Mode
The application includes a demo mode that uses localStorage when the database/API is not available, allowing you to test the functionality without a backend setup.
