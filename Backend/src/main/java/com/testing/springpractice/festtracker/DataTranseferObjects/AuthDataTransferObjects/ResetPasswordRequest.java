package com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    @NotBlank
    @Email
    private String username;
    @NotBlank
    private String otp;
    @NotBlank
    @Size(min = 8, max = 15)
    private String newPassword;
}

