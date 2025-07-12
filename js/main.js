/**
 * Main JavaScript file for Student Medical System
 * Handles form submissions, data loading, and UI interactions
 */

// Global variables
let students = [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Student Medical System initialized');
    loadStudents();
    
    // Add form submit event listener
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
});

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = getFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    try {
        showLoading(true);
        const response = await submitStudent(formData);
        
        if (response.success) {
            showAlert('Student added successfully!', 'success');
            clearForm();
            loadStudents();
        } else {
            showAlert('Error adding student: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('Error adding student. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

/**
 * Get form data
 */
function getFormData() {
    return {
        student_id: document.getElementById('studentId').value.trim(),
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        date_of_birth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        emergency_contact_name: document.getElementById('emergencyContact').value.trim(),
        emergency_contact_phone: document.getElementById('emergencyPhone').value.trim(),
        medical_conditions: document.getElementById('medicalConditions').value.trim(),
        allergies: document.getElementById('allergies').value.trim(),
        medications: document.getElementById('medications').value.trim(),
        blood_type: document.getElementById('bloodType').value
    };
}

/**
 * Validate form data
 */
function validateFormData(data) {
    const requiredFields = ['student_id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'email'];
    
    for (let field of requiredFields) {
        if (!data[field]) {
            showAlert(`Please fill in the ${field.replace('_', ' ')} field.`, 'danger');
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return false;
    }
    
    // Validate date of birth (not in future)
    const dob = new Date(data.date_of_birth);
    const today = new Date();
    if (dob > today) {
        showAlert('Date of birth cannot be in the future.', 'danger');
        return false;
    }
    
    return true;
}

/**
 * Submit student data to the server
 */
async function submitStudent(data) {
    try {
        const response = await fetch('api/students.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting student:', error);
        
        // If API is not available, simulate success for demo
        const mockResponse = {
            success: true,
            message: 'Student added successfully (demo mode)',
            student_id: data.student_id
        };
        
        // Add to local storage for demo
        addStudentToLocal(data);
        
        return mockResponse;
    }
}

/**
 * Load students from server
 */
async function loadStudents() {
    try {
        showLoading(true);
        
        const response = await fetch('api/students.php?action=list');
        
        if (response.ok) {
            const data = await response.json();
            students = data.students || [];
        } else {
            // Load from local storage for demo
            students = getStudentsFromLocal();
        }
        
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        
        // Load demo data if API is not available
        students = getStudentsFromLocal();
        displayStudents(students);
        
        showAlert('Loaded demo data (API not available)', 'info');
    } finally {
        showLoading(false);
    }
}

/**
 * Display students in the table
 */
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-users fa-2x mb-2"></i><br>
                    No students found. Add a student to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr class="fade-in">
            <td><strong>${escapeHtml(student.student_id)}</strong></td>
            <td>
                ${escapeHtml(student.first_name)} ${escapeHtml(student.last_name)}
                ${student.medical_conditions && student.medical_conditions !== 'None' ? 
                    '<span class="badge bg-warning ms-1" title="Has medical conditions"><i class="fas fa-exclamation-triangle"></i></span>' : ''}
            </td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.phone || 'N/A')}</td>
            <td>
                ${student.blood_type ? 
                    `<span class="badge bg-primary">${escapeHtml(student.blood_type)}</span>` : 
                    '<span class="text-muted">N/A</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewStudent('${student.student_id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="editStudent('${student.student_id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${student.student_id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Clear the form
 */
function clearForm() {
    document.getElementById('studentForm').reset();
    removeAlert();
}

/**
 * Show loading state
 */
function showLoading(isLoading) {
    const submitBtn = document.querySelector('#studentForm button[type="submit"]');
    const refreshBtn = document.querySelector('button[onclick="loadStudents()"]');
    
    if (isLoading) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
        }
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Loading...';
        }
    } else {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Save Student';
        }
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Refresh';
        }
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    removeAlert();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.getElementById('studentForm');
    form.parentNode.insertBefore(alertDiv, form);
    
    // Auto-remove after 5 seconds
    setTimeout(removeAlert, 5000);
}

/**
 * Remove alert message
 */
function removeAlert() {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * View student details (placeholder)
 */
function viewStudent(studentId) {
    const student = students.find(s => s.student_id === studentId);
    if (student) {
        alert(`Student Details:\n\nName: ${student.first_name} ${student.last_name}\nID: ${student.student_id}\nEmail: ${student.email}\nPhone: ${student.phone || 'N/A'}\nBlood Type: ${student.blood_type || 'N/A'}\nMedical Conditions: ${student.medical_conditions || 'None'}\nAllergies: ${student.allergies || 'None'}`);
    }
}

/**
 * Edit student (placeholder)
 */
function editStudent(studentId) {
    showAlert('Edit functionality would be implemented here.', 'info');
}

/**
 * Delete student (placeholder)
 */
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        // Remove from local storage for demo
        removeStudentFromLocal(studentId);
        loadStudents();
        showAlert('Student deleted successfully.', 'success');
    }
}

// Local storage functions for demo purposes
function addStudentToLocal(student) {
    let localStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Add ID and timestamps
    student.id = Date.now();
    student.created_at = new Date().toISOString();
    student.updated_at = new Date().toISOString();
    
    localStudents.push(student);
    localStorage.setItem('students', JSON.stringify(localStudents));
}

function getStudentsFromLocal() {
    const stored = localStorage.getItem('students');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Return sample data if nothing in localStorage
    return [
        {
            id: 1,
            student_id: 'STU001',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '2000-05-15',
            gender: 'Male',
            email: 'john.doe@example.com',
            phone: '555-0123',
            address: '123 Main St, City, State 12345',
            emergency_contact_name: 'Jane Doe',
            emergency_contact_phone: '555-0124',
            medical_conditions: 'None',
            allergies: 'Peanuts',
            medications: 'None',
            blood_type: 'O+',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
            id: 2,
            student_id: 'STU002',
            first_name: 'Sarah',
            last_name: 'Smith',
            date_of_birth: '1999-08-22',
            gender: 'Female',
            email: 'sarah.smith@example.com',
            phone: '555-0125',
            address: '456 Oak Ave, City, State 12345',
            emergency_contact_name: 'Robert Smith',
            emergency_contact_phone: '555-0126',
            medical_conditions: 'Asthma',
            allergies: 'None',
            medications: 'Albuterol Inhaler',
            blood_type: 'A+',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        }
    ];
}

function removeStudentFromLocal(studentId) {
    let localStudents = JSON.parse(localStorage.getItem('students') || '[]');
    localStudents = localStudents.filter(s => s.student_id !== studentId);
    localStorage.setItem('students', JSON.stringify(localStudents));
}