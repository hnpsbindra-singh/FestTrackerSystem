package com.testing.springpractice.festtracker.Configurations;

import com.testing.springpractice.festtracker.Models.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtUtils {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private Long expiration;
    public String generateToken(String username, Role role){
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+expiration))
                .addClaims(Map.of("role", role.name()))
                .signWith(getSignedKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    private Key getSignedKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    public Claims generateDetails(String token){
       return Jwts.parser().
                setSigningKey(getSignedKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    private String getUsername(String token){
        return generateDetails(token).getSubject();
    }
    private String getRole(String token){
       return generateDetails(token).get("role", String.class);
    }
    public Date getExpiration(String token){
        return generateDetails(token).getExpiration();
    }
    public boolean isExpired(String token){
        return getExpiration(token).before(new Date());
    }
}
