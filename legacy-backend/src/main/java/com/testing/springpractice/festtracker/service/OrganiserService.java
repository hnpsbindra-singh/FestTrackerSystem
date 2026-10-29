package com.testing.springpractice.festtracker.service;

import com.cloudinary.utils.ObjectUtils;
import com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.Receiver;
import com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.*;
import com.testing.springpractice.festtracker.models.Bookings;
import com.testing.springpractice.festtracker.models.Fest;
import com.testing.springpractice.festtracker.models.PaymentStatus;
import com.testing.springpractice.festtracker.models.SeatingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface OrganiserService {

    String addEvent(FestCreationRequest request, MultipartFile paymentQr, MultipartFile poster) throws IOException;
    List<FestDetails> viewAllEvents();
    EntireFestDetails festDetails(UUID eventId);
    List<SeatingDetails> getSeatingDetails(UUID eventId);
    Page<BookingDetails> getBookingDetails(UUID eventId, int page, int size);
    String declineTicket(UUID eventId, UUID bookingId);
    String cancelEvent(UUID eventId);
    String verifyTicket(UUID eventId, String bookingKey);
}
