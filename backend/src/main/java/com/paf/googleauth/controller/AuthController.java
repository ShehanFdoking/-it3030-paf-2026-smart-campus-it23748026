package com.paf.googleauth.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.paf.googleauth.dto.GoogleLoginRequest;
import com.paf.googleauth.dto.GoogleLoginResponse;
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
}
