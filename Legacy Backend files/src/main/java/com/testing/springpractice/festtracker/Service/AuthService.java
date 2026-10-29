package com.testing.springpractice.festtracker.Service;

import com.testing.springpractice.festtracker.Configurations.JwtUtils;
import com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects.LoginRequest;
import com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects.ResetPasswordRequest;
import com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects.VerifyEmailRequest;
import com.testing.springpractice.festtracker.Models.Users;
import com.testing.springpractice.festtracker.Repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisTemplate<String, RegisterRequest> redisTemplateReq;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;


    public AuthService(UserRepository userRepository, RedisTemplate<String, String> redisTemplate, RedisTemplate<String, RegisterRequest> redisTemplateReq, EmailService emailService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.redisTemplateReq = redisTemplateReq;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public String register(@Valid RegisterRequest request) {
        if(userRepository.existsByUsername(request.getUsername().toLowerCase().trim())){
            throw new RuntimeException("User already exists");
        }
        int oneTime = 100000 + (int)(Math.random() * 900000);
        String otp = Integer.toString(oneTime);
        request.setUsername(request.getUsername().toLowerCase().trim());
        redisTemplate.opsForValue().set("user: "+request.getUsername(),
                otp,
                5,
                TimeUnit.MINUTES);
        request.setPassword(passwordEncoder.encode(request.getPassword()));
        redisTemplateReq.opsForValue().set("userObject: " + request.getUsername(),
                request,
                5,
                TimeUnit.MINUTES);
        emailService.sendOtp(request.getUsername(), request.getName(), otp);
        return "Otp Sent Successfully";
    }

    public String verify(@Valid VerifyEmailRequest verifyEmailRequest) {
        RegisterRequest registerRequest = redisTemplateReq.opsForValue().get("userObject: " + verifyEmailRequest.getUsername().toLowerCase().trim());
        String storedOtp = redisTemplate.opsForValue().get("user: "+verifyEmailRequest.getUsername().toLowerCase().trim());
        if (storedOtp == null) {
            throw new RuntimeException("OTP expired.");
        }

        if (!storedOtp.equals(verifyEmailRequest.getOtp())) {
            throw new RuntimeException("Invalid OTP.");
        }
        if (registerRequest == null) {
            throw new RuntimeException("Registration expired.");
        }
        Users user = Users.builder()
                .role(registerRequest.getRole())
                .name(registerRequest.getName())
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .mobile(registerRequest.getMobile())
                .verified(true)
                .build();
        userRepository.save(user);
        redisTemplateReq.delete("userObject: " + verifyEmailRequest.getUsername());
        redisTemplate.delete("user: "+verifyEmailRequest.getUsername());
        return "Registration Successful";


    }


    public String login(@Valid LoginRequest request) {
        request.setUsername(request.getUsername().toLowerCase().trim());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword()
        ));
        Users user = userRepository.findByUsername(request.getUsername());
        return jwtUtils.generateToken(request.getUsername(), user.getRole());
    }

    public String sendOtp(String username) {
        username = username.toLowerCase().trim();
        if (!userRepository.existsByUsername(username)) throw new RuntimeException("User Doesn't Exist");
        int oneTime = 100000 + (int)(Math.random() * 900000);
        String otp = Integer.toString(oneTime);
        redisTemplate.opsForValue().set("username:" + username
                , otp,
                5,
                TimeUnit.MINUTES);
        emailService.sendOtp(username, "user", otp);
        return "Otp Sent Successfully";
    }

    public String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest) {
        String username = resetPasswordRequest.getUsername().toLowerCase().trim();
        String storedOtp = redisTemplate.opsForValue().get("username:" + username);
        if (storedOtp == null) {
            throw new RuntimeException("OTP expired.");
        }
        if (!storedOtp.equals(resetPasswordRequest.getOtp())) {
            throw new RuntimeException("Invalid OTP.");
        }
        int rowsAffected = userRepository.updatepasswordForusername(
                passwordEncoder.encode(resetPasswordRequest.getNewPassword()),
                username
        );
        if (rowsAffected == 0) {
            return "Password update failed";
        }
        redisTemplate.delete("username:" + username);
        return "Password updated successfully";
    }
}
