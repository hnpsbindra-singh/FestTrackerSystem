package com.testing.springpractice.festtracker.Configurations;

import com.testing.springpractice.festtracker.Models.Users;
import com.testing.springpractice.festtracker.Repository.UserRepository;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class UserVerificationClass {

    private final UserRepository userRepository;

    public UserVerificationClass(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Before("@within(com.testing.springpractice.festtracker.Configurations.VerifiedUser)")
    public void checkVerification(){
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        if (authentication==null) throw new RuntimeException("No logged in user");
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        if (user==null) throw new RuntimeException("Invalid access");
        if (!user.getVerified()||!user.isEnabled()){
            throw new RuntimeException("User either Banned by admin or Not verified");
        }
    }
}
