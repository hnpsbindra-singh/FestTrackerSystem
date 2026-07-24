package com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects;

import com.testing.springpractice.festtracker.Models.SeatingType;
import com.testing.springpractice.festtracker.Models.Users;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
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
}
