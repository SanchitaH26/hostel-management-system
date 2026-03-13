package com.hostel.controller;

import com.hostel.model.Complaint;
import com.hostel.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    // ─── STUDENT ENDPOINTS ────────────────────────────────────────

    // POST /api/complaints/{studentId} → raise a complaint
    @PostMapping("/{studentId}")
    public ResponseEntity<?> create(
            @RequestBody Complaint complaint,
            @PathVariable Long studentId) {
        try {
            Complaint saved = complaintService.createComplaint(complaint, studentId);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/complaints/student/{studentId} → view own complaints
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Complaint>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(complaintService.getComplaintsByStudent(studentId));
    }

    // GET /api/complaints/{id} → get single complaint
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(complaintService.getComplaintById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

    // GET /api/complaints → view all complaints
    @GetMapping
    public ResponseEntity<List<Complaint>> getAll() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // GET /api/complaints/status/{status} → filter by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Complaint>> getByStatus(@PathVariable String status) {
        Complaint.Status s = Complaint.Status.valueOf(status.toUpperCase());
        return ResponseEntity.ok(complaintService.getByStatus(s));
    }

    // PUT /api/complaints/{id}/status → update complaint status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remark) {
        try {
            Complaint.Status s = Complaint.Status.valueOf(status.toUpperCase());
            Complaint updated = complaintService.updateStatus(id, s, remark);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/complaints/{id} → delete complaint
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            complaintService.deleteComplaint(id);
            return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/complaints/stats → dashboard statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(complaintService.getDashboardStats());
    }
}
