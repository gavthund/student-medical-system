<?php
/**
 * Student API Endpoints
 * Handles CRUD operations for students
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class StudentAPI {
    private $conn;

    public function __construct() {
        try {
            $this->conn = getDBConnection();
        } catch (Exception $e) {
            $this->sendError('Database connection failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle the API request
     */
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        try {
            switch ($method) {
                case 'GET':
                    if ($action === 'list') {
                        $this->getStudents();
                    } elseif (isset($_GET['id'])) {
                        $this->getStudent($_GET['id']);
                    } else {
                        $this->getStudents();
                    }
                    break;

                case 'POST':
                    $this->createStudent();
                    break;

                case 'PUT':
                    $this->updateStudent();
                    break;

                case 'DELETE':
                    if (isset($_GET['id'])) {
                        $this->deleteStudent($_GET['id']);
                    } else {
                        $this->sendError('Student ID required for deletion');
                    }
                    break;

                default:
                    $this->sendError('Method not allowed', 405);
            }
        } catch (Exception $e) {
            $this->sendError('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all students
     */
    private function getStudents() {
        $query = "SELECT * FROM students ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $students = $stmt->fetchAll();
        
        $this->sendSuccess([
            'students' => $students,
            'count' => count($students)
        ]);
    }

    /**
     * Get a single student
     */
    private function getStudent($id) {
        $query = "SELECT * FROM students WHERE id = ? OR student_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id, $id]);
        
        $student = $stmt->fetch();
        
        if ($student) {
            $this->sendSuccess(['student' => $student]);
        } else {
            $this->sendError('Student not found', 404);
        }
    }

    /**
     * Create a new student
     */
    private function createStudent() {
        $input = $this->getJsonInput();
        
        // Validate required fields
        $required = ['student_id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'email'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->sendError("Field '$field' is required");
                return;
            }
        }

        // Check if student_id already exists
        $checkQuery = "SELECT id FROM students WHERE student_id = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->execute([$input['student_id']]);
        
        if ($checkStmt->fetch()) {
            $this->sendError('Student ID already exists');
            return;
        }

        // Check if email already exists
        $checkQuery = "SELECT id FROM students WHERE email = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->execute([$input['email']]);
        
        if ($checkStmt->fetch()) {
            $this->sendError('Email already exists');
            return;
        }

        $query = "INSERT INTO students (
            student_id, first_name, last_name, date_of_birth, gender, email, phone,
            address, emergency_contact_name, emergency_contact_phone, 
            medical_conditions, allergies, medications, blood_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        $success = $stmt->execute([
            $input['student_id'],
            $input['first_name'],
            $input['last_name'],
            $input['date_of_birth'],
            $input['gender'],
            $input['email'],
            $input['phone'] ?? null,
            $input['address'] ?? null,
            $input['emergency_contact_name'] ?? null,
            $input['emergency_contact_phone'] ?? null,
            $input['medical_conditions'] ?? null,
            $input['allergies'] ?? null,
            $input['medications'] ?? null,
            $input['blood_type'] ?? null
        ]);

        if ($success) {
            $this->sendSuccess([
                'message' => 'Student created successfully',
                'student_id' => $input['student_id'],
                'id' => $this->conn->lastInsertId()
            ]);
        } else {
            $this->sendError('Failed to create student');
        }
    }

    /**
     * Update a student
     */
    private function updateStudent() {
        $input = $this->getJsonInput();
        
        if (empty($input['id']) && empty($input['student_id'])) {
            $this->sendError('Student ID or ID is required for update');
            return;
        }

        $query = "UPDATE students SET 
            first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, 
            email = ?, phone = ?, address = ?, emergency_contact_name = ?, 
            emergency_contact_phone = ?, medical_conditions = ?, allergies = ?, 
            medications = ?, blood_type = ?, updated_at = CURRENT_TIMESTAMP
            WHERE " . (isset($input['id']) ? "id = ?" : "student_id = ?");

        $stmt = $this->conn->prepare($query);
        $success = $stmt->execute([
            $input['first_name'],
            $input['last_name'],
            $input['date_of_birth'],
            $input['gender'],
            $input['email'],
            $input['phone'] ?? null,
            $input['address'] ?? null,
            $input['emergency_contact_name'] ?? null,
            $input['emergency_contact_phone'] ?? null,
            $input['medical_conditions'] ?? null,
            $input['allergies'] ?? null,
            $input['medications'] ?? null,
            $input['blood_type'] ?? null,
            $input['id'] ?? $input['student_id']
        ]);

        if ($success && $stmt->rowCount() > 0) {
            $this->sendSuccess(['message' => 'Student updated successfully']);
        } else {
            $this->sendError('Student not found or no changes made', 404);
        }
    }

    /**
     * Delete a student
     */
    private function deleteStudent($id) {
        $query = "DELETE FROM students WHERE id = ? OR student_id = ?";
        $stmt = $this->conn->prepare($query);
        $success = $stmt->execute([$id, $id]);

        if ($success && $stmt->rowCount() > 0) {
            $this->sendSuccess(['message' => 'Student deleted successfully']);
        } else {
            $this->sendError('Student not found', 404);
        }
    }

    /**
     * Get JSON input
     */
    private function getJsonInput() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->sendError('Invalid JSON input');
        }
        
        return $input;
    }

    /**
     * Send success response
     */
    private function sendSuccess($data = null) {
        $response = ['success' => true];
        if ($data) {
            $response = array_merge($response, $data);
        }
        echo json_encode($response);
        exit;
    }

    /**
     * Send error response
     */
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }
}

// Handle the request
$api = new StudentAPI();
$api->handleRequest();
?>