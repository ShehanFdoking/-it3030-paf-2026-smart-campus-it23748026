package com.paf.googleauth.dto;

public record GoogleLoginResponse(
        String name,
        String email,
        String picture,
        boolean emailVerified) {
}
