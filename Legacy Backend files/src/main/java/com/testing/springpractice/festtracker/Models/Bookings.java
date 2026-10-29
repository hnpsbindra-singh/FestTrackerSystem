package com.testing.springpractice.festtracker.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.stereotype.Indexed;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bookings {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    @JoinColumn(name = "fest_id", nullable = false)
    private Fest fest;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
    @ManyToOne
    @JoinColumn(name = "seating_id", nullable = false)
    private SeatingType seatingType;
    @Column(nullable = false)
    private Long slots;
    @Column(nullable = false)
    private Long totalCost;
    @CreationTimestamp
    private LocalDateTime bookingDatetime;
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PAYMENT_PENDING;
    @Column(unique = true)
    private String bookingKey;

    private String transactionId;
    public boolean checkedIn=false;

}
