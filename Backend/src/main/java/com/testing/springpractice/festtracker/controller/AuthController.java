package com.testing.springpractice.festtracker.controller;

import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.LoginRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.ResetPasswordRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.VerifyEmailRequest;
import com.testing.springpractice.festtracker.service.AuthService;
import com.testing.springpractice.festtracker.serviceImpl.AuthServiceImpl;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthServiceImpl authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request){
        return authService.register(request);

    }
    @PostMapping("/verify-otp")
    public String verify(@Valid @RequestBody VerifyEmailRequest request){
        return authService.verify(request);
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String username){
        return authService.sendOtp(username);
    }
    @PutMapping("/verify-otp")
    public String verifyOtp(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest){
        return authService.verifyPassword(resetPasswordRequest);
    }
}
