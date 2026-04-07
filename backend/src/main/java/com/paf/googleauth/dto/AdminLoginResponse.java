package com.paf.googleauth.dto;

public record AdminLoginResponse(
                String name,
                String email,
                boolean admin,
                String role) {
}