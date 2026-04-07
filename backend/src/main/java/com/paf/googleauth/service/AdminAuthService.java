package com.paf.googleauth.service;

import com.paf.googleauth.dto.AdminLoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminAuthService {

    private final String adminEmail;
    private String adminPassword;
    private final String technicianEmail;
    private final String technicianPassword;

    public AdminAuthService(
            @Value("${app.admin.email:admin@gmail.com}") String adminEmail,
            @Value("${app.admin.default-password:admin123}") String adminPassword,
            @Value("${app.technician.email:tech@gamil.com}") String technicianEmail,
            @Value("${app.technician.default-password:tech123}") String technicianPassword) {
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.technicianEmail = technicianEmail;
        this.technicianPassword = technicianPassword;
    }

    public synchronized AdminLoginResponse login(String email, String password) {
        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password)) {
            return new AdminLoginResponse("Administrator", adminEmail, true, "ADMIN");
        }

        if (isTechnicianEmail(email) && technicianPassword.equals(password)) {
            return new AdminLoginResponse("Technician", technicianEmail, false, "TECHNICIAN");
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    public synchronized void changePassword(String email, String currentPassword, String newPassword) {
        if (!adminEmail.equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only the configured admin account can change password");
        }

        if (!adminPassword.equals(currentPassword)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        if (newPassword.equals(currentPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "New password must be different from current password");
        }

        adminPassword = newPassword;
    }

    private boolean isTechnicianEmail(String email) {
        if (email == null) {
            return false;
        }
        String normalized = email.trim().toLowerCase();
        return technicianEmail.equalsIgnoreCase(normalized);
    }
}