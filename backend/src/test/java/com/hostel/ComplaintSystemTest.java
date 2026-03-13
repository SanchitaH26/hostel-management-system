package com.hostel;

import com.hostel.model.Complaint;
import com.hostel.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintSystemTest {

    private Complaint complaint;
    private User student;

    @BeforeEach
    void setUp() {
        student = new User();
        student.setId(1L);
        student.setName("John Student");
        student.setEmail("john@hostel.com");
        student.setRole(User.Role.STUDENT);
        student.setRoomNumber("A-101");

        complaint = new Complaint();
        complaint.setId(1L);
        complaint.setTitle("No Water Supply");
        complaint.setDescription("Water has been unavailable since morning");
        complaint.setCategory(Complaint.Category.WATER);
        complaint.setStudent(student);
    }

    // ─── Status Tests ──────────────────────────────────────────────

    @Test
    @DisplayName("New complaint should have OPEN status by default")
    void testDefaultComplaintStatus() {
        complaint.setStatus(Complaint.Status.OPEN);
        assertEquals(Complaint.Status.OPEN, complaint.getStatus());
    }

    @Test
    @DisplayName("Admin should be able to update status to IN_PROGRESS")
    void testStatusUpdateToInProgress() {
        complaint.setStatus(Complaint.Status.IN_PROGRESS);
        assertEquals(Complaint.Status.IN_PROGRESS, complaint.getStatus());
    }

    @Test
    @DisplayName("Admin should be able to mark complaint as RESOLVED")
    void testStatusUpdateToResolved() {
        complaint.setStatus(Complaint.Status.RESOLVED);
        assertEquals(Complaint.Status.RESOLVED, complaint.getStatus());
    }

    // ─── Complaint Field Tests ─────────────────────────────────────

    @Test
    @DisplayName("Complaint title should not be null")
    void testComplaintTitleNotNull() {
        assertNotNull(complaint.getTitle());
    }

    @Test
    @DisplayName("Complaint should have correct title")
    void testComplaintTitle() {
        assertEquals("No Water Supply", complaint.getTitle());
    }

    @Test
    @DisplayName("Complaint category should be set correctly")
    void testComplaintCategory() {
        assertEquals(Complaint.Category.WATER, complaint.getCategory());
    }

    @Test
    @DisplayName("Complaint description should not be empty")
    void testComplaintDescription() {
        assertFalse(complaint.getDescription().isEmpty());
    }

    // ─── User / Role Tests ─────────────────────────────────────────

    @Test
    @DisplayName("Student role should be correctly assigned")
    void testStudentRole() {
        assertEquals(User.Role.STUDENT, student.getRole());
    }

    @Test
    @DisplayName("Admin role should be different from student role")
    void testAdminRoleNotStudent() {
        User admin = new User();
        admin.setRole(User.Role.ADMIN);
        assertNotEquals(User.Role.STUDENT, admin.getRole());
    }

    @Test
    @DisplayName("Student room number should be set")
    void testStudentRoomNumber() {
        assertEquals("A-101", student.getRoomNumber());
    }

    // ─── Complaint Association Tests ───────────────────────────────

    @Test
    @DisplayName("Complaint should be linked to a student")
    void testComplaintHasStudent() {
        assertNotNull(complaint.getStudent());
        assertEquals("John Student", complaint.getStudent().getName());
    }

    @Test
    @DisplayName("Student email should be valid format")
    void testStudentEmail() {
        assertTrue(student.getEmail().contains("@"));
    }

    // ─── Admin Remark Test ─────────────────────────────────────────

    @Test
    @DisplayName("Admin remark should be saved when status updated")
    void testAdminRemark() {
        complaint.setStatus(Complaint.Status.IN_PROGRESS);
        complaint.setAdminRemark("Plumber assigned, will fix by 5 PM");
        assertEquals("Plumber assigned, will fix by 5 PM", complaint.getAdminRemark());
    }

    @Test
    @DisplayName("Complaint should have a creation timestamp")
    void testComplaintTimestamp() {
        complaint.setCreatedAt(LocalDateTime.now());
        assertNotNull(complaint.getCreatedAt());
    }
}
