package com.testing.springpractice.festtracker.Controller;

import com.testing.springpractice.festtracker.Configurations.VerifiedUser;
import com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.SeatingDetails;
import com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects.*;
import com.testing.springpractice.festtracker.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@VerifiedUser
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/find-Events-Nearby")
    public Page<FestInformation> findEvents(@RequestParam Double latitude,
                                            @RequestParam Double longitude,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            @RequestParam(defaultValue = "10") int radius){
        return userService.findEvents(latitude, longitude, page, size, radius);

    }

    @PostMapping("/bookings/initiate")
    public BookingResponse initiateBooking(@Valid @RequestBody BookingInitiateRequest request) {
        return userService.initiateBooking(request);
    }
    @PostMapping("/bookings/{bookingId}/confirm")
    public String confirmBooking(
            @PathVariable UUID bookingId,
            @Valid @RequestBody PaymentConfirmRequest request
    ) {
        return userService.confirmBooking(bookingId, request);
    }

    @GetMapping("/events/{eventId}")
    public FestInformationBrief getEventDetails(@PathVariable UUID eventId) {
        return userService.getEventDetails(eventId);
    }
    @GetMapping("/events/{eventId}/seating")
    public List<SeatingDetails> getSeatingDetails(@PathVariable UUID eventId) {
        return userService.getSeatingDetails(eventId);
    }

    @GetMapping("/bookings")
    public Page<UserBookingDetails> getBookingsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getBookingsHistory(page, size);
    }
}
