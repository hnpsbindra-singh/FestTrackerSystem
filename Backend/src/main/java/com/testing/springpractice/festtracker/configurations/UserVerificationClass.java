package com.testing.springpractice.festtracker.configurations;

import com.testing.springpractice.festtracker.models.Users;
import com.testing.springpractice.festtracker.repository.UserRepository;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@Aspect
public class UserVerificationClass {

    private final UserRepository userRepository;

    public UserVerificationClass(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Before("@within(com.testing.springpractice.festtracker.configurations.VerifiedUser)")
    public void checkVerification(){
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        if (authentication==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No logged in user");
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        if (user==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access");
        if (!user.getVerified()||!user.isEnabled()){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User either Banned by admin or Not verified");
        }
    }
}
