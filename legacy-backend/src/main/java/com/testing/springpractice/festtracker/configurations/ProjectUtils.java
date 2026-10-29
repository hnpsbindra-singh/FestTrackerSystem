package com.testing.springpractice.festtracker.Configurations;

import com.testing.springpractice.festtracker.Models.Users;
import com.testing.springpractice.festtracker.Repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ProjectUtils {


    private final UserRepository userRepository;

    public ProjectUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void userExists(Users user){
        if(user==null) throw new RuntimeException("User Doesn't Exist");
    }

    public Users getCurrent(){
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        return user;
    }
    public String bookingKey(){
        String recoveryKey = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase();
        return recoveryKey;
    }
}
