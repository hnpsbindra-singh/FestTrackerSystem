package com.testing.springpractice.festtracker.Repository;

import com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.BookingDetails;
import com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.SeatingDetails;
import com.testing.springpractice.festtracker.Models.SeatingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface SeatingRepository extends JpaRepository<SeatingType, UUID> {
    @Query("select new com.testing.springpractice.festtracker.DataTranseferObjects.OrganiserDataTransferObjects.SeatingDetails(" +
            "s.id, s.name, s.price, s.totalSeats, s.availableSeats) " +
            "from SeatingType s where s.fest.id = :eventId")
    List<SeatingDetails> getSeatingDetailsByFestId(UUID eventId);


    @Modifying
    @Transactional
    @Query("update SeatingType s " +
            "set s.availableSeats = s.availableSeats - :slots " +
            "where s.id = :seatingId And s.availableSeats>=:slots")
    int deductSeatsAtomic(UUID seatingId, int slots);


}

