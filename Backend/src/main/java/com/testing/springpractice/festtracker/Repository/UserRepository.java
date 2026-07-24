package com.testing.springpractice.festtracker.Repository;

import com.testing.springpractice.festtracker.Models.Users;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, UUID> {
    Users findByUsername(String username);
    boolean existsByUsername(String username);

    @Modifying
    @Transactional
    @Query("update Users u " +
            "set u.password = :password " +
            "where u.username = :username")
    int updatepasswordForusername(String password,String username);
}
