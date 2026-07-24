package com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects;

import jakarta.persistence.Column;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FestCreationRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or in the future")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    @NotBlank(message = "Address is required")
    private String detailedAddress;

    @NotBlank(message = "Duration is required")
    private String duration;

    @NotNull(message = "Age limit is required")
    @Min(value = 0, message = "Age limit cannot be negative")
    private Long ageLimit;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Genre is required")
    private String genre;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;
    @NotBlank
    private String bankAccountNumber;
    @NotBlank
    private String ifscCode;
    @NotBlank
    private String accountHolderName;


    @NotEmpty(message = "At least one seating type must be defined")
    @Valid
    @Builder.Default
    private List<SeatingTypeRequest> seatingTypeRequests = new ArrayList<>();
}
