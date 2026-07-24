package com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects;

import com.testing.springpractice.festtracker.Models.PaymentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserBookingDetails {
    private UUID id;
    private String festTitle;
    private LocalDate festDate;
    private LocalTime festTime;
    private String detailedAddress;
    private String seatingName;
    private Long slots;
    private Long totalCost;
    private PaymentStatus paymentStatus;
    private String bookingKey;
    private boolean checkedIn;
}
