package com.testing.springpractice.festtracker.serviceImpl;

import com.testing.springpractice.festtracker.configurations.JwtUtils;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.LoginRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.ResetPasswordRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.AuthDataTransferObjects.VerifyEmailRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.DeclineTicketMessageDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.OtpKafkaDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.SendBookingDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.SendFestCancellationMailDTO;
import com.testing.springpractice.festtracker.models.Users;
import com.testing.springpractice.festtracker.repository.UserRepository;
import com.testing.springpractice.festtracker.service.AuthService;
import com.testing.springpractice.festtracker.service.MessagingService;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisTemplate<String, Object> redisTemplateReq;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    public final KafkaTemplate<String, OtpKafkaDTO> otpKafka;

    public AuthServiceImpl(UserRepository userRepository, RedisTemplate<String, String> redisTemplate, RedisTemplate<String, Object> redisTemplateReq, MessagingService emailService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtils jwtUtils, KafkaTemplate<String, OtpKafkaDTO> otpKafka, KafkaTemplate<String, DeclineTicketMessageDTO> declineKafka, KafkaTemplate<String, SendBookingDTO> bookingKafka, KafkaTemplate<String, SendFestCancellationMailDTO> festKafka) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.redisTemplateReq = redisTemplateReq;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.otpKafka = otpKafka;
    }

    public String register(@Valid RegisterRequest request) {
        if(userRepository.existsByUsername(request.getUsername().toLowerCase().trim())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
        }
        int oneTime = 100000 + SECURE_RANDOM.nextInt(900000);
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
        OtpKafkaDTO otpKafkaDTO = new OtpKafkaDTO(request.getUsername(), request.getName(), otp);
        otpKafka.send("otp-Service", request.getUsername(), otpKafkaDTO);
        return "Otp Sent Successfully";
    }

    public String verify(@Valid VerifyEmailRequest verifyEmailRequest) {
        RegisterRequest registerRequest = (RegisterRequest) redisTemplateReq.opsForValue().get("userObject: " + verifyEmailRequest.getUsername().toLowerCase().trim());
        String storedOtp = redisTemplate.opsForValue().get("user: "+verifyEmailRequest.getUsername().toLowerCase().trim());
        if (storedOtp == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP expired.");
        }

        if (!storedOtp.equals(verifyEmailRequest.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP.");
        }
        if (registerRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration expired.");
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
        if (!userRepository.existsByUsername(username)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User Doesn't Exist");
        int oneTime = 100000 + SECURE_RANDOM.nextInt(900000);
        String otp = Integer.toString(oneTime);
        redisTemplate.opsForValue().set("username:" + username
                , otp,
                5,
                TimeUnit.MINUTES);
        OtpKafkaDTO otpKafkaDTO = new OtpKafkaDTO(username, new String("user"), otp);
        otpKafka.send("otp-Service", username, otpKafkaDTO);
        return "Otp Sent Successfully";
    }

    public String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest) {
        String username = resetPasswordRequest.getUsername().toLowerCase().trim();
        String storedOtp = redisTemplate.opsForValue().get("username:" + username);
        if (storedOtp == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP expired.");
        }
        if (!storedOtp.equals(resetPasswordRequest.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP.");
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
