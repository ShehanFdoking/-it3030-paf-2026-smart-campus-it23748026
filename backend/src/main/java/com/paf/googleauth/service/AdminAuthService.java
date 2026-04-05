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

    public AdminAuthService(
            @Value("${app.admin.email:admin@gmail.com}") String adminEmail,
            @Value("${app.admin.default-password:admin123}") String adminPassword) {
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    public synchronized AdminLoginResponse login(String email, String password) {
        if (!adminEmail.equalsIgnoreCase(email) || !adminPassword.equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin email or password");
        }

        return new AdminLoginResponse("Administrator", adminEmail, true);
    }

    public synchronized void changePassword(String email, String currentPassword, String newPassword) {
        if (!adminEmail.equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the configured admin account can change password");
        }

        if (!adminPassword.equals(currentPassword)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        if (newPassword.equals(currentPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        adminPassword = newPassword;
    }
}