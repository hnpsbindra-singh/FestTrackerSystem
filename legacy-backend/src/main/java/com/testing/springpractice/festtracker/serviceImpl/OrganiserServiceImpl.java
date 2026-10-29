package com.testing.springpractice.festtracker.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.testing.springpractice.festtracker.Configurations.ProjectUtils;
import com.testing.springpractice.festtracker.DataTranseferObjects.EmailDataTransferObjects.Receiver;
import com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.*;
import com.testing.springpractice.festtracker.Models.Bookings;
import com.testing.springpractice.festtracker.Models.Fest;
import com.testing.springpractice.festtracker.Models.PaymentStatus;
import com.testing.springpractice.festtracker.Models.SeatingType;
import com.testing.springpractice.festtracker.Repository.BookingRepository;
import com.testing.springpractice.festtracker.Repository.FestRepository;
import com.testing.springpractice.festtracker.Repository.SeatingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrganiserService {
    private final ProjectUtils projectUtils;
    private final FestRepository festRepository;
    private final SeatingRepository seatingRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final Cloudinary cloudinary;

    public OrganiserService(ProjectUtils projectUtils, FestRepository festRepository, SeatingRepository seatingRepository, BookingRepository bookingRepository, EmailService emailService, Cloudinary cloudinary) {
        this.projectUtils = projectUtils;
        this.festRepository = festRepository;
        this.seatingRepository = seatingRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.cloudinary = cloudinary;
    }

    @Transactional
    public String addEvent(FestCreationRequest request, MultipartFile paymentQr) throws IOException {
        Fest fest = Fest.builder()
                .organiser(projectUtils.getCurrent())
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .time(request.getTime())
                .detailedAddress(request.getDetailedAddress())
                .duration(request.getDuration())
                .ageLimit(request.getAgeLimit())
                .language(request.getLanguage())
                .genre(request.getGenre())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .bankAccountNumber(request.getBankAccountNumber())
                .accountHolderName(request.getAccountHolderName())
                .ifscCode(request.getIfscCode())
                .build();
        Map upload = cloudinary.uploader().upload(
                paymentQr.getBytes(),
                ObjectUtils.emptyMap()
        );
        String url = upload.get("secure_url").toString();
        fest.setPaymentQrURL(url);
        List<SeatingType> list = new ArrayList<>();
        for (SeatingTypeRequest i : request.getSeatingTypeRequests()){
            SeatingType seating = SeatingType.builder()
                    .name(i.getName())
                    .price(i.getPrice())
                    .totalSeats(i.getTotalSeats())
                    .availableSeats(i.getTotalSeats())
                    .fest(fest)
                    .build();
            list.add(seating);
        }
        fest.setSeats(list);
        festRepository.save(fest);
        return "Fest Creation Success";
    }

    public List<FestDetails> viewAllEvents() {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        return festRepository.getFestDetailsByUsername(username);
    }

    public EntireFestDetails festDetails(UUID eventId) {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        int isAdmin = festRepository.isOwnerOfTheFest(eventId, username);
        if (isAdmin==0) throw new RuntimeException("Invalid Access");
        return festRepository.entireFestDetails(eventId);
    }

    public List<SeatingDetails> getSeatingDetails(UUID eventId) {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        int isAdmin = festRepository.isOwnerOfTheFest(eventId, username);
        if (isAdmin==0) throw new RuntimeException("Invalid Access");
        return seatingRepository.getSeatingDetailsByFestId(eventId);
    }

    public Page<BookingDetails> getBookingDetails(UUID eventId, int page, int size) {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        int isAdmin = festRepository.isOwnerOfTheFest(eventId, username);
        if (isAdmin==0) throw new RuntimeException("Invalid Access");
        Pageable number = PageRequest.of(page, size);
        return bookingRepository.getBookingDetailsByFestId(eventId, PaymentStatus.PAYMENT_SUBMITTED, number);

    }

    @Transactional
    public String declineTicket(UUID eventId, UUID bookingId) {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        int isAdmin = festRepository.isOwnerOfTheFest(eventId, username);
        if (isAdmin==0) throw new RuntimeException("Invalid Access");
        Bookings booking = bookingRepository.findById(bookingId).orElseThrow(
                ()->new RuntimeException("Invalid booking")
        );
        if (!booking.getFest().getId().equals(eventId)) {
            throw new RuntimeException("Booking does not belong to this event");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAYMENT_REJECTED) {
            return "Booking is already declined";
        }
        booking.setPaymentStatus(PaymentStatus.PAYMENT_REJECTED);
        bookingRepository.save(booking);
        SeatingType seating = booking.getSeatingType();
        if (seating != null) {
            seating.setAvailableSeats(seating.getAvailableSeats() + booking.getSlots().intValue());
            seatingRepository.save(seating);
        }
        emailService.sendDeclineMessage(
                booking.getUser().getUsername(),
                booking.getUser().getName(),
                booking.getFest().getTitle()
        );
        return "Ticket Declined Successfully & Seats Restored";

    }

    @Transactional
    public String cancelEvent(UUID eventId) {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        int isAdmin = festRepository.isOwnerOfTheFest(eventId, username);
        if (isAdmin==0) throw new RuntimeException("Invalid Access");
        Fest fest = festRepository.findById(eventId).orElseThrow(()->new RuntimeException("Invalid Event"));
        List<Receiver> email = festRepository.getUsernameOfUsers(eventId);
        if (email != null && !email.isEmpty()) {
            emailService.sendFestCancellationMail(email, fest.getTitle());
        }
        fest.setActive(false);
        festRepository.save(fest);
        return "Fest cancelled successfully";
    }

    public String verifyTicket(UUID eventId, String bookingKey) {
        Authentication authentication = SecurityContextHolder.
                getContext().getAuthentication();
        String username = authentication.getName();
        int isAdmin = festRepository.isOwnerOfTheFest(eventId, username);
        if (isAdmin==0) throw new RuntimeException("Invalid Access");
        int rows = bookingRepository.verifyTicket(eventId, bookingKey, PaymentStatus.PAYMENT_SUBMITTED);
        if (rows == 0) throw new RuntimeException("Invalid key or Key already checked in");
        return "Successfully verified";

    }
}
