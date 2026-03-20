package com.hostel.controller;

import com.hostel.model.Complaint;
import com.hostel.model.ComplaintLog;
import com.hostel.repository.ComplaintLogRepository;
import com.hostel.repository.ComplaintRepository;
import com.hostel.service.ComplaintService;
import com.hostel.service.PriorityValidationService;
import com.hostel.service.PriorityValidationService.ValidationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired private ComplaintService complaintService;
    @Autowired private PriorityValidationService priorityValidator;
    @Autowired private ComplaintLogRepository logRepository;
    @Autowired private ComplaintRepository complaintRepository;

    // POST /api/complaints/{studentId}
    @PostMapping("/{studentId}")
    public ResponseEntity<?> create(
            @RequestBody Complaint complaint,
            @PathVariable Long studentId) {
        try {
            if (complaint.getPriority() == null) {
                complaint.setPriority(Complaint.Priority.MEDIUM);
            }

            System.out.println("[ComplaintController] Validating priority: " + complaint.getPriority());
            ValidationResult validation = priorityValidator.validate(
                    complaint.getTitle(),
                    complaint.getDescription(),
                    complaint.getCategory(),
                    complaint.getPriority()
            );
            System.out.println("[ComplaintController] Validation result: " + validation.valid);

            if (!validation.valid) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error",             "PRIORITY_MISMATCH",
                        "message",           validation.message,
                        "suggestedPriority", validation.suggestedPriority != null
                                                 ? validation.suggestedPriority : "MEDIUM"
                ));
            }

            Complaint saved = complaintService.createComplaint(complaint, studentId);

            // Save first log entry
            String studentName = saved.getStudent() != null ? saved.getStudent().getName() : "Student";
            logRepository.save(new ComplaintLog(saved,
                    "Complaint submitted — Status: OPEN | Priority: " + saved.getPriority().name(),
                    studentName));

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/complaints/student/{studentId}
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Complaint>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(complaintService.getComplaintsByStudent(studentId));
    }

    // GET /api/complaints/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(complaintService.getComplaintById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/complaints/{id}/logs  ← NEW endpoint for timeline
    @GetMapping("/{id}/logs")
    public ResponseEntity<?> getLogs(@PathVariable Long id) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Not found"));
            return ResponseEntity.ok(logRepository.findByComplaintOrderByTimestampAsc(complaint));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/complaints
    @GetMapping
    public ResponseEntity<List<Complaint>> getAll() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // GET /api/complaints/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Complaint>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(complaintService.getByStatus(
                Complaint.Status.valueOf(status.toUpperCase())));
    }

    // PUT /api/complaints/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remark) {
        try {
            Complaint.Status s = Complaint.Status.valueOf(status.toUpperCase());
            Complaint updated = complaintService.updateStatus(id, s, remark);

            // Save log entry for status change
            String logMessage = "Status changed to: " + s.name() +
                    (remark != null && !remark.isBlank() ? " — Remark: " + remark : "");
            logRepository.save(new ComplaintLog(updated, logMessage, "Admin"));

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/complaints/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            complaintService.deleteComplaint(id);
            return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/complaints/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(complaintService.getDashboardStats());
    }
}