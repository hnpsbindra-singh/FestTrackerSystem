package com.testing.springpractice.festtracker.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    private Users organiser;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false)
    private LocalDate date;
    @Column(nullable = false)
    private LocalTime time;
    @Column(nullable = false)
    private String detailedAddress;
    @OneToMany(mappedBy = "fest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeatingType> seats = new ArrayList<>();
    @Column(nullable = false)
    private String duration;
    @Column(nullable = false)
    private Long ageLimit;
    @Column(nullable = false)
    private String language;
    @Column(nullable = false)
    private String genre;
    @Column(nullable = false)
    private Double latitude;
    @Column(nullable = false)
    private Double longitude;
    @Builder.Default
    private Boolean active = true;
    @OneToMany(mappedBy = "fest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Bookings> bookings = new ArrayList<>();

    @Column(nullable = false)
    private String bankAccountNumber;
    @Column(nullable = false)
    private String ifscCode;
    @Column(nullable = false)
    private String accountHolderName;
    @Column(nullable = false)
    private String paymentQrURL;

}