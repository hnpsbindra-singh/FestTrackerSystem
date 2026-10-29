package com.testing.springpractice.festtracker.configurations;

import com.testing.springpractice.festtracker.models.Users;
import com.testing.springpractice.festtracker.repository.BookingRepository;
import com.testing.springpractice.festtracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@Component
public class ProjectUtils {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    private static final char[] BASE32_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ".toCharArray();
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public ProjectUtils(UserRepository userRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public void userExists(Users user){
        if(user==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User Doesn't Exist");
    }

    public Users getCurrent(){
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    public String generateUniqueBookingKey() {
        int maxAttempts = 10;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            String candidateKey = generateFormattedKey(8);
            if (!bookingRepository.existsByBookingKey(candidateKey)) {
                return candidateKey;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate a unique booking key after " + maxAttempts + " attempts");
    }

    public String bookingKey() {
        return generateUniqueBookingKey();
    }

    private String generateFormattedKey(int charCount) {
        StringBuilder sb = new StringBuilder("FT-");
        for (int i = 0; i < charCount; i++) {
            if (i > 0 && i % 4 == 0) {
                sb.append('-');
            }
            sb.append(BASE32_ALPHABET[SECURE_RANDOM.nextInt(BASE32_ALPHABET.length)]);
        }
        return sb.toString();
    }
}
