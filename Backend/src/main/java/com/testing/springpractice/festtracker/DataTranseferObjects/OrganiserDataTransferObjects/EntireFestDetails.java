package com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EntireFestDetails {
    private UUID id;
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private String detailedAddress;
    private String duration;
    private Long ageLimit;
    private String language;
    private String genre;
    private String bankAccountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String paymentQrURL;

}
