package com.testing.springpractice.festtracker.serviceImpl;

import com.testing.springpractice.festtracker.configurations.ProjectUtils;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.SendBookingDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.SeatingDetails;
import com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects.*;
import com.testing.springpractice.festtracker.models.Bookings;
import com.testing.springpractice.festtracker.models.Fest;
import com.testing.springpractice.festtracker.models.PaymentStatus;
import com.testing.springpractice.festtracker.models.SeatingType;
import com.testing.springpractice.festtracker.models.Users;
import com.testing.springpractice.festtracker.repository.BookingRepository;
import com.testing.springpractice.festtracker.repository.FestRepository;
import com.testing.springpractice.festtracker.repository.SeatingRepository;
import com.testing.springpractice.festtracker.service.MessagingService;
import com.testing.springpractice.festtracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private final FestRepository festRepository;
    private final SeatingRepository seatingRepository;
    private final ProjectUtils projectUtils;
    private final BookingRepository bookingRepository;
    private final MessagingService emailService;
    private final KafkaTemplate<String, Object> kafka;

    public UserServiceImpl(FestRepository festRepository, SeatingRepository seatingRepository, ProjectUtils projectUtils, BookingRepository bookingRepository, MessagingService emailService, KafkaTemplate<String, Object> kafka) {
        this.festRepository = festRepository;
        this.seatingRepository = seatingRepository;
        this.projectUtils = projectUtils;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.kafka = kafka;
    }

    public Page<FestInformation> findEvents(Double latitude, Double longitude, int page, int size, int radius) {
        Pageable pageable = PageRequest.of(page, size);
        return festRepository.findNearbyEvents(latitude, longitude, radius, pageable);
    }

    @Transactional
    public BookingResponse initiateBooking(@Valid BookingInitiateRequest request) {
        Fest fest = festRepository.findById(request.getFestId()).orElseThrow(
                ()->new ResponseStatusException(HttpStatus.NOT_FOUND, "Fest Not Found")
        );
        SeatingType seatingType = seatingRepository.findById(request.getSeatingTypeId()).orElseThrow(
                ()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seating Not Foundx")
        );

        if (seatingType.getAvailableSeats() < request.getSlots()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not Enough Seats available");
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking Not Found"));

        Users currentUser = projectUtils.getCurrent();
        if (currentUser == null || !booking.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: You do not own this booking");
        }

        if (booking.getPaymentStatus() != PaymentStatus.PAYMENT_PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is not in pending state");
        }
        int rowsUpdated = seatingRepository.deductSeatsAtomic(
                booking.getSeatingType().getId(),
                booking.getSlots().intValue()
        );
        if (rowsUpdated == 1) {
            booking.setBookingKey(projectUtils.generateUniqueBookingKey());
            booking.setTransactionId(request.getTransactionId());
            booking.setPaymentStatus(PaymentStatus.PAYMENT_SUBMITTED);

            bookingRepository.save(booking);
            SendBookingDTO dto = new SendBookingDTO( booking.getUser().getUsername(),
                    booking.getUser().getName(),
                    booking.getBookingKey());
            kafka.send("send-Booking-Service", dto.username(), dto);
            return "Booking Submitted Successfully! Booking Key: " + booking.getBookingKey();
        } else {
            booking.setPaymentStatus(PaymentStatus.PAYMENT_REJECTED);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seats occupied before payment");
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
