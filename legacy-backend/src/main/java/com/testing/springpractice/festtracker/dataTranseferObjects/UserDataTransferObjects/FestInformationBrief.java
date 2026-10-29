package com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestInformationBrief {
    private UUID id;
    private String organiserName;
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private String detailedAddress;
    private String duration;
    private Long ageLimit;
    private String language;
    private String genre;
    private Boolean active;
    private String posterUrl;
}
