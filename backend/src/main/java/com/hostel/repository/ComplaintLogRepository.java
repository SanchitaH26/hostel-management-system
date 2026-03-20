package com.hostel.repository;

import com.hostel.model.Complaint;
import com.hostel.model.ComplaintLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintLogRepository extends JpaRepository<ComplaintLog, Long> {
    List<ComplaintLog> findByComplaintOrderByTimestampAsc(Complaint complaint);
}