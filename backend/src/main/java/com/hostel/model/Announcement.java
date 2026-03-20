package com.hostel.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type = Type.INFO;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean active = true;

    public enum Type { INFO, WARNING, URGENT }

    // Getters
    public Long getId()                  { return id; }
    public String getTitle()             { return title; }
    public String getMessage()           { return message; }
    public Type getType()                { return type; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public boolean isActive()            { return active; }

    // Setters
    public void setId(Long id)                  { this.id = id; }
    public void setTitle(String title)          { this.title = title; }
    public void setMessage(String message)      { this.message = message; }
    public void setType(Type type)              { this.type = type; }
    public void setCreatedAt(LocalDateTime t)   { this.createdAt = t; }
    public void setActive(boolean active)       { this.active = active; }
}