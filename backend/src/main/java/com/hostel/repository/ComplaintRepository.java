package com.hostel.repository;

import com.hostel.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStudentId(Long studentId);

    List<Complaint> findByStatus(Complaint.Status status);

    List<Complaint> findByCategory(Complaint.Category category);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'OPEN'")
    long countOpenComplaints();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'IN_PROGRESS'")
    long countInProgressComplaints();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'RESOLVED'")
    long countResolvedComplaints();

    List<Complaint> findAllByOrderByCreatedAtDesc();
}
