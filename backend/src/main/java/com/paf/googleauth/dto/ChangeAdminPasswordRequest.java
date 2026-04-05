package com.paf.googleauth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeAdminPasswordRequest(
        @NotBlank @Email String email,
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String newPassword) {
}