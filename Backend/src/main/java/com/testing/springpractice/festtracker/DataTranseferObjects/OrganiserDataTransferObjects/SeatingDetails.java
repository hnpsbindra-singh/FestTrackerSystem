package com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SeatingDetails {
    private UUID id;
    private String name;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer availableSeats;
}
