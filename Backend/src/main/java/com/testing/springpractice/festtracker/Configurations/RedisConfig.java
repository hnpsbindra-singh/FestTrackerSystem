package com.testing.springpractice.festtracker.Configurations;

import com.testing.springpractice.festtracker.DataTranseferObjects.AuthDataTransferObjects.RegisterRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    final RedisConnectionFactory connectionFactory;

    public RedisConfig(RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }
    @Bean
    public RedisTemplate<String, String> redisTemplate(){
        RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(connectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }
    @Bean
    public RedisTemplate<String, RegisterRequest> registerRequestRedisTemplate(){
        RedisTemplate<String, RegisterRequest> requestRedisTemplate = new RedisTemplate<>();
        JacksonJsonRedisSerializer<RegisterRequest> jsonRedisSerializer = new JacksonJsonRedisSerializer<>(RegisterRequest.class);
        requestRedisTemplate.setConnectionFactory(connectionFactory);
        requestRedisTemplate.setKeySerializer(new StringRedisSerializer());
        requestRedisTemplate.setValueSerializer(jsonRedisSerializer);
        requestRedisTemplate.setHashKeySerializer(new StringRedisSerializer());
        requestRedisTemplate.setHashValueSerializer(jsonRedisSerializer);
        return requestRedisTemplate;
    }

}
