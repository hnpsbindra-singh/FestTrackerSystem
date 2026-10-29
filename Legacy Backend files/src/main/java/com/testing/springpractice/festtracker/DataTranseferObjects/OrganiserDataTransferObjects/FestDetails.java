package com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestDetails {
    private UUID id;
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private String detailedAddress;

}
