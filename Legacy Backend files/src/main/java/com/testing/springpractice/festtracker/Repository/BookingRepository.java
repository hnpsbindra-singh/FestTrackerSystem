package com.testing.springpractice.festtracker.Repository;

import com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.BookingDetails;
import com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects.UserBookingDetails;
import com.testing.springpractice.festtracker.Models.Bookings;
import com.testing.springpractice.festtracker.Models.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Bookings, UUID> {
    @Query("select new com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.BookingDetails(" +
            "b.id," +
            "b.user.name," +
            "b.user.username," +
            "b.user.mobile," +
            "b.seatingType.name," +
            "b.slots," +
            "b.totalCost," +
            "b.bookingDatetime," +
            "b.transactionId) from Bookings b where b.fest.id=:eventId and b.paymentStatus = :status")
    Page<BookingDetails> getBookingDetailsByFestId(UUID eventId, PaymentStatus status, Pageable page);

    @Modifying
    @Transactional
    @Query("update Bookings b " +
            "set b.checkedIn=true where b.fest.id = :eventId AND b.bookingKey = :bookingKey AND b.checkedIn = false And b.paymentStatus = :status")
    int verifyTicket(UUID eventId, String bookingKey, PaymentStatus status);

    @Query("select new com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects.UserBookingDetails(" +
            "b.id," +
            "b.fest.title," +
            "b.fest.date," +
            "b.fest.time," +
            "b.fest.detailedAddress," +
            "b.seatingType.name," +
            "b.slots," +
            "b.totalCost," +
            "b.paymentStatus," +
            "b.bookingKey," +
            "b.checkedIn) from Bookings b where b.user.username = :username order by b.bookingDatetime desc")
    Page<UserBookingDetails> findBookingsByUsername(String username, Pageable pageable);
}
