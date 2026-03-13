package com.hostel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT;

    private String roomNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Complaint> complaints;

    public enum Role { STUDENT, ADMIN }

    // ─── Getters ──────────────────────────────────────────────────
    public Long getId()            { return id; }
    public String getName()        { return name; }
    public String getEmail()       { return email; }
    public String getPassword()    { return password; }
    public Role getRole()          { return role; }
    public String getRoomNumber()  { return roomNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ─── Setters ──────────────────────────────────────────────────
    public void setId(Long id)              { this.id = id; }
    public void setName(String name)        { this.name = name; }
    public void setEmail(String email)      { this.email = email; }
    public void setPassword(String password){ this.password = password; }
    public void setRole(Role role)          { this.role = role; }
    public void setRoomNumber(String r)     { this.roomNumber = r; }
    public void setCreatedAt(LocalDateTime t){ this.createdAt = t; }

    // ─── Builder ──────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final User user = new User();
        public Builder name(String v)       { user.name = v; return this; }
        public Builder email(String v)      { user.email = v; return this; }
        public Builder password(String v)   { user.password = v; return this; }
        public Builder role(Role v)         { user.role = v; return this; }
        public Builder roomNumber(String v) { user.roomNumber = v; return this; }
        public User build()                 { return user; }
    }
}