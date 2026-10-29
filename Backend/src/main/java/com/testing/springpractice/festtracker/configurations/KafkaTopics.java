package com.testing.springpractice.festtracker.configurations;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopics {
    @Bean
    public NewTopic otpTopic(){
        return TopicBuilder.name("otp-Service")
                .partitions(3)
                .replicas(3)
                .build();
    }
    @Bean
    public NewTopic declineTicketTopic(){
        return TopicBuilder.name("Decline-Ticket-Service")
                .partitions(3)
                .replicas(3)
                .build();
    }
    @Bean
    public NewTopic declineEventTopic(){
        return TopicBuilder.name("Decline-Event-Service")
                .partitions(3)
                .replicas(3)
                .build();
    }
    @Bean
    public NewTopic sendBookingTopic(){
        return TopicBuilder.name("send-Booking-Service")
                .partitions(3)
                .replicas(3)
                .build();
    }
}
