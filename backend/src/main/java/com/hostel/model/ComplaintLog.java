package com.hostel.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_logs")
public class ComplaintLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String performedBy;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public ComplaintLog() {}

    public ComplaintLog(Complaint complaint, String action, String performedBy) {
        this.complaint   = complaint;
        this.action      = action;
        this.performedBy = performedBy;
        this.timestamp   = LocalDateTime.now();
    }

    // Getters
    public Long getId()                 { return id; }
    public Complaint getComplaint()     { return complaint; }
    public String getAction()           { return action; }
    public String getPerformedBy()      { return performedBy; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // Setters
    public void setId(Long id)                      { this.id = id; }
    public void setComplaint(Complaint complaint)   { this.complaint = complaint; }
    public void setAction(String action)            { this.action = action; }
    public void setPerformedBy(String p)            { this.performedBy = p; }
    public void setTimestamp(LocalDateTime t)       { this.timestamp = t; }
}