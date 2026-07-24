package com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookingDetails {
    private UUID id;
    private String customerName;
    private String customerUsername;
    private String customerMobile;
    private String seatingName;
    private Long slots;
    private Long totalCost;
    private LocalDateTime bookingDatetime;
    private String transactionId;
}
