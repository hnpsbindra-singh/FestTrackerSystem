package com.testing.springpractice.festtracker.service;

import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.LoginRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.ResetPasswordRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.VerifyEmailRequest;
import com.testing.springpractice.festtracker.models.Users;
import jakarta.validation.Valid;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.concurrent.TimeUnit;

public interface AuthService {

    String register(@Valid RegisterRequest request);
    String verify(@Valid VerifyEmailRequest verifyEmailRequest);
    String login(@Valid LoginRequest request);
    String sendOtp(String username);
    String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest);
}
