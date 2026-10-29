package com.testing.springpractice.festtracker.service;

import com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.SeatingDetails;
import com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects.*;
import com.testing.springpractice.festtracker.models.Bookings;
import com.testing.springpractice.festtracker.models.Fest;
import com.testing.springpractice.festtracker.models.PaymentStatus;
import com.testing.springpractice.festtracker.models.SeatingType;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface UserService {

    Page<FestInformation> findEvents(Double latitude, Double longitude, int page, int size, int radius);
    BookingResponse initiateBooking(@Valid BookingInitiateRequest request);
    String confirmBooking(UUID bookingId, @Valid PaymentConfirmRequest request);
    FestInformationBrief getEventDetails(UUID eventId);
    List<SeatingDetails> getSeatingDetails(UUID eventId);
    Page<UserBookingDetails> getBookingsHistory(int page, int size);
}
