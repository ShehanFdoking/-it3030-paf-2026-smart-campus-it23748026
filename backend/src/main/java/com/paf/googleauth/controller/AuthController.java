package com.paf.googleauth.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.paf.googleauth.dto.AdminLoginRequest;
import com.paf.googleauth.dto.AdminLoginResponse;
import com.paf.googleauth.dto.ChangeAdminPasswordRequest;
import com.paf.googleauth.dto.GoogleLoginRequest;
import com.paf.googleauth.dto.GoogleLoginResponse;
import com.paf.googleauth.service.AdminAuthService;
import com.paf.googleauth.service.GoogleTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AdminAuthService adminAuthService;
    private final GoogleTokenService googleTokenService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @PostMapping("/auth/google")
    public GoogleLoginResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenService.verify(request.idToken());

        Object emailVerified = payload.get("email_verified");
        if (!(emailVerified instanceof Boolean verified) || !verified) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }

        String email = payload.getEmail();
        String name = payload.get("name") instanceof String n ? n : "Google User";
        String picture = payload.get("picture") instanceof String p ? p : "";

        return new GoogleLoginResponse(name, email, picture, true);
    }

    @PostMapping("/auth/admin/login")
    public AdminLoginResponse adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request.email(), request.password());
    }

    @PostMapping("/admin/profile/password")
    public Map<String, String> changeAdminPassword(@Valid @RequestBody ChangeAdminPasswordRequest request) {
        adminAuthService.changePassword(request.email(), request.currentPassword(), request.newPassword());
        return Map.of("message", "Admin password updated successfully");
    }
}
