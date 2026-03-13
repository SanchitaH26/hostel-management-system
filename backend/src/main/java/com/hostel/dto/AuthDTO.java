package com.hostel.dto;

public class AuthDTO {

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String roomNumber;
        private String role;

        public String getName()       { return name; }
        public String getEmail()      { return email; }
        public String getPassword()   { return password; }
        public String getRoomNumber() { return roomNumber; }
        public String getRole()       { return role; }

        public void setName(String v)       { this.name = v; }
        public void setEmail(String v)      { this.email = v; }
        public void setPassword(String v)   { this.password = v; }
        public void setRoomNumber(String v) { this.roomNumber = v; }
        public void setRole(String v)       { this.role = v; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail()    { return email; }
        public String getPassword() { return password; }

        public void setEmail(String v)    { this.email = v; }
        public void setPassword(String v) { this.password = v; }
    }

    public static class AuthResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String roomNumber;
        private String message;

        public AuthResponse(Long id, String name, String email,
                            String role, String roomNumber, String message) {
            this.id = id; this.name = name; this.email = email;
            this.role = role; this.roomNumber = roomNumber; this.message = message;
        }

        public Long getId()           { return id; }
        public String getName()       { return name; }
        public String getEmail()      { return email; }
        public String getRole()       { return role; }
        public String getRoomNumber() { return roomNumber; }
        public String getMessage()    { return message; }
    }
}