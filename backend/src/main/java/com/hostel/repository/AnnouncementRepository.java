package com.hostel.repository;

import com.hostel.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Get all active announcements newest first — for students
    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();
    // Get all announcements newest first — for admin
    List<Announcement> findAllByOrderByCreatedAtDesc();
}