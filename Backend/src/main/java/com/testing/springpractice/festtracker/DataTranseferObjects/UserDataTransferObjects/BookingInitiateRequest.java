package com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingInitiateRequest {
    @NotNull(message = "Fest ID is required")
    private UUID festId;
    @NotNull(message = "Seating Type ID is required")
    private UUID seatingTypeId;
    @NotNull(message = "Slots count is required")
    @Min(value = 1, message = "Must book at least 1 slot")
    private Long slots;
}
