package com.hostel.service;

import com.hostel.model.Complaint;
import com.hostel.model.User;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    // Student: Create new complaint
    public Complaint createComplaint(Complaint complaint, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        complaint.setStudent(student);
        complaint.setStatus(Complaint.Status.OPEN);
        return complaintRepository.save(complaint);
    }

    // Student: View own complaints
    public List<Complaint> getComplaintsByStudent(Long studentId) {
        return complaintRepository.findByStudentId(studentId);
    }

    // Admin: View all complaints
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    // Admin: Update complaint status
    public Complaint updateStatus(Long id, Complaint.Status status, String adminRemark) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + id));

        complaint.setStatus(status);
        if (adminRemark != null && !adminRemark.isBlank()) {
            complaint.setAdminRemark(adminRemark);
        }
        return complaintRepository.save(complaint);
    }

    // Admin: Get dashboard stats
    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", complaintRepository.count());
        stats.put("open", complaintRepository.countOpenComplaints());
        stats.put("inProgress", complaintRepository.countInProgressComplaints());
        stats.put("resolved", complaintRepository.countResolvedComplaints());
        return stats;
    }

    // Get single complaint
    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    // Delete complaint
    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }

    // Filter by status
    public List<Complaint> getByStatus(Complaint.Status status) {
        return complaintRepository.findByStatus(status);
    }
}
