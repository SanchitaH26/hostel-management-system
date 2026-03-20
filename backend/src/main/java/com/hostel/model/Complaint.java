package com.hostel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.OPEN;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "admin_remark")
    private String adminRemark;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum Category { WATER, ELECTRICITY, INTERNET, CLEANLINESS, FURNITURE, OTHER }
    public enum Status   { OPEN, IN_PROGRESS, RESOLVED }
    public enum Priority { LOW, MEDIUM, HIGH, URGENT }

    // ─── Getters ──────────────────────────────────────────────────
    public Long getId()                  { return id; }
    public String getTitle()             { return title; }
    public String getDescription()       { return description; }
    public Category getCategory()        { return category; }
    public Priority getPriority()        { return priority; }
    public Status getStatus()            { return status; }
    public User getStudent()             { return student; }
    public String getAdminRemark()       { return adminRemark; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    // ─── Setters ──────────────────────────────────────────────────
    public void setId(Long id)                  { this.id = id; }
    public void setTitle(String title)          { this.title = title; }
    public void setDescription(String d)        { this.description = d; }
    public void setCategory(Category c)         { this.category = c; }
    public void setPriority(Priority p)         { this.priority = p; }
    public void setStatus(Status s)             { this.status = s; }
    public void setStudent(User u)              { this.student = u; }
    public void setAdminRemark(String r)        { this.adminRemark = r; }
    public void setCreatedAt(LocalDateTime t)   { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)   { this.updatedAt = t; }
}