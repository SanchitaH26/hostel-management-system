package com.hostel.controller;

import com.hostel.model.Announcement;
import com.hostel.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    // GET /api/announcements → students see active announcements
    @GetMapping
    public ResponseEntity<List<Announcement>> getActive() {
        return ResponseEntity.ok(
                announcementRepository.findByActiveTrueOrderByCreatedAtDesc()
        );
    }

    // GET /api/announcements/all → admin sees all including inactive
    @GetMapping("/all")
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(
                announcementRepository.findAllByOrderByCreatedAtDesc()
        );
    }

    // POST /api/announcements → admin creates announcement
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Announcement announcement) {
        try {
            announcement.setActive(true);
            Announcement saved = announcementRepository.save(announcement);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/announcements/{id}/deactivate → admin deactivates
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        try {
            Announcement a = announcementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Not found"));
            a.setActive(false);
            announcementRepository.save(a);
            return ResponseEntity.ok(Map.of("message", "Announcement deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/announcements/{id} → admin deletes
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            announcementRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}