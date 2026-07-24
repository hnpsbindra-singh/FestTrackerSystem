package com.testing.springpractice.festtracker.Service;

import com.testing.springpractice.festtracker.Configurations.ProjectUtils;
import com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.SeatingDetails;
import com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects.*;
import com.testing.springpractice.festtracker.Models.Bookings;
import com.testing.springpractice.festtracker.Models.Fest;
import com.testing.springpractice.festtracker.Models.PaymentStatus;
import com.testing.springpractice.festtracker.Models.SeatingType;
import com.testing.springpractice.festtracker.Repository.BookingRepository;
import com.testing.springpractice.festtracker.Repository.FestRepository;
import com.testing.springpractice.festtracker.Repository.SeatingRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final FestRepository festRepository;
    private final SeatingRepository seatingRepository;
    private final ProjectUtils projectUtils;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    public UserService(FestRepository festRepository, SeatingRepository seatingRepository, ProjectUtils projectUtils, BookingRepository bookingRepository, EmailService emailService) {
        this.festRepository = festRepository;
        this.seatingRepository = seatingRepository;
        this.projectUtils = projectUtils;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
    }

    public Page<FestInformation> findEvents(Double latitude, Double longitude, int page, int size, int radius) {
        Pageable pageable = PageRequest.of(page, size);
        return festRepository.findNearbyEvents(latitude, longitude, radius, pageable);
    }

    @Transactional
    public BookingResponse initiateBooking(@Valid BookingInitiateRequest request) {
        Fest fest = festRepository.findById(request.getFestId()).orElseThrow(
                ()->new RuntimeException("Fest Doesn't exist")
        );
        SeatingType seatingType = seatingRepository.findById(request.getSeatingTypeId()).orElseThrow(
                ()-> new RuntimeException("Invalid Seating type")
        );

        if (seatingType.getAvailableSeats() < request.getSlots()) {
            throw new RuntimeException("Not enough seats available");
        }

        Long totalCost = seatingType.getPrice().multiply(BigDecimal.valueOf(request.getSlots())).longValue();
        Bookings bookings  = Bookings.builder()
                .fest(fest)
                .user(projectUtils.getCurrent())
                .seatingType(seatingType)
                .slots(request.getSlots())
                .totalCost(totalCost)
                .paymentStatus(PaymentStatus.PAYMENT_PENDING)
                .checkedIn(false)
                .build();
        Bookings saved = bookingRepository.save(bookings);
        return BookingResponse.builder()
                .bookingId(saved.getId())
                .totalCost(saved.getTotalCost())
                .bankAccountNumber(fest.getBankAccountNumber())
                .ifscCode(fest.getIfscCode())
                .accountHolderName(fest.getAccountHolderName())
                .paymentQrURL(fest.getPaymentQrURL())
                .build();
    }

    @Transactional
    public String confirmBooking(UUID bookingId, @Valid PaymentConfirmRequest request) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getPaymentStatus() != PaymentStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking is not in pending state");
        }
        int rowsUpdated = seatingRepository.deductSeatsAtomic(
                booking.getSeatingType().getId(),
                booking.getSlots().intValue()
        );
        if (rowsUpdated == 1) {
            booking.setBookingKey(projectUtils.bookingKey());
            booking.setTransactionId(request.getTransactionId());
            booking.setPaymentStatus(PaymentStatus.PAYMENT_SUBMITTED);

            bookingRepository.save(booking);
            emailService.sendBooking(
                    booking.getUser().getUsername(),
                    booking.getUser().getName(),
                    booking.getBookingKey()
            );
            return "Booking Submitted Successfully! Booking Key: " + booking.getBookingKey();
        } else {
            booking.setPaymentStatus(PaymentStatus.PAYMENT_REJECTED);
            bookingRepository.save(booking);
            throw new RuntimeException("Sold out: Seats became unavailable during checkout.");
        }
    }

    public FestInformationBrief getEventDetails(UUID eventId) {
        return festRepository.getEventDetails(eventId);
    }

    public List<SeatingDetails> getSeatingDetails(UUID eventId) {
        return seatingRepository.getSeatingDetailsByFestId(eventId);
    }

    public Page<UserBookingDetails> getBookingsHistory(int page, int size) {
        String username = projectUtils.getCurrent().getUsername();
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findBookingsByUsername(username, pageable);
    }
}
