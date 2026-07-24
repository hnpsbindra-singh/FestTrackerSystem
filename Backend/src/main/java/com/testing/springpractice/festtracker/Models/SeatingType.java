package com.testing.springpractice.festtracker.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatingType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private BigDecimal price;
    @Column(nullable = false)
    private Integer totalSeats;
    @Column(nullable = false)
    private Integer availableSeats;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fest_id", nullable = false)
    private Fest fest;
    @OneToMany(mappedBy = "seatingType")
    private List<Bookings> bookings= new ArrayList<>();
}