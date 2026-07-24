package com.testing.springpractice.festtracker.Configurations;

import com.testing.springpractice.festtracker.Repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/api/auth")){
            filterChain.doFilter(request, response);
            return;
        }
        String token = request.getHeader("Authorization");
        String jwt = null;
        if (token!=null&&token.startsWith("Bearer ")){
            jwt = token.substring(7);
        }
        if (jwt!=null&&SecurityContextHolder.getContext().getAuthentication()==null){
                Claims claims = jwtUtils.generateDetails(jwt);
                UserDetails details = userRepository.findByUsername(claims.getSubject());
                if (!jwtUtils.isExpired(jwt)&&details!=null){
                    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                            claims.getSubject(), jwt, details.getAuthorities()
                    ));
                }
        }
        filterChain.doFilter(request,response);
    }
}
