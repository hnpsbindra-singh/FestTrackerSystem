package com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String username;
    @NotBlank(message = "Password is required")
    private String password;
}