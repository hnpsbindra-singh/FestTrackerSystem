package com.testing.springpractice.festtracker.controller;

import com.testing.springpractice.festtracker.configurations.VerifiedUser;
import com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.*;
import com.testing.springpractice.festtracker.service.OrganiserService;
import com.testing.springpractice.festtracker.serviceImpl.OrganiserServiceImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organiser")
@VerifiedUser
public class OrganiserController {

    private final OrganiserService organiserService;

    public OrganiserController(OrganiserServiceImpl organiserService) {
        this.organiserService = organiserService;
    }

    @PostMapping("/addEvent")
    public String addEvent(    @Valid @RequestPart("fest") FestCreationRequest request,
                               @RequestPart("paymentQr") MultipartFile paymentQr,
                               @RequestPart(value = "poster", required = false) MultipartFile poster){
        try {
            return organiserService.addEvent(request, paymentQr, poster);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload files", e);
        }
    }
    @GetMapping("/view-my-events")
    public List<FestDetails> viewMyEvents(){
        return organiserService.viewAllEvents();
    }
    @GetMapping("/view-my-events/{eventId}")
    public EntireFestDetails festDetails(@PathVariable UUID eventId){
        return organiserService.festDetails(eventId);
    }
    @GetMapping("/view-my-events/{eventId}/seats")
    public List<SeatingDetails> getSeatingDetails(@PathVariable UUID eventId){
        return organiserService.getSeatingDetails(eventId);
    }
    @GetMapping("/view-my-events/{eventId}/bookings")
    public Page<BookingDetails> getBookingDetails(@PathVariable UUID eventId,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size){
        return organiserService.getBookingDetails(eventId, page, size);
    }
    @PatchMapping("/view-my-events/{eventId}/{bookingId}/decline")
    public String declineTicket(@PathVariable UUID eventId, @PathVariable UUID bookingId){
        return organiserService.declineTicket(eventId, bookingId);
    }
    @PatchMapping("/view-my-events/{eventId}/cancel")
    public String cancelEvent(@PathVariable UUID eventId){
        return organiserService.cancelEvent(eventId);
    }
    @GetMapping("/view-my-events/{eventId}/verify/{bookingKey}")
    public String verifyTicket(@PathVariable UUID eventId, @PathVariable String bookingKey){
        return organiserService.verifyTicket(eventId, bookingKey);
    }

}
