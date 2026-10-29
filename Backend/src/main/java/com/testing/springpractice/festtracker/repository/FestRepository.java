package com.testing.springpractice.festtracker.repository;

import com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.Receiver;
import com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.EntireFestDetails;
import com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.FestDetails;
import com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects.FestInformation;
import com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects.FestInformationBrief;
import com.testing.springpractice.festtracker.models.Fest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FestRepository extends JpaRepository<Fest, UUID> {
    @Query("SELECT new com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.FestDetails( " +
            "f.id, " +
            "f.title, " +
            "f.description, " +
            "f.date, " +
            "f.time, " +
            "f.detailedAddress, " +
            "f.posterUrl) from Fest f where f.organiser.username = :username")
    List<FestDetails> getFestDetailsByUsername(String username);

    @Query("select count(*) from Fest f where f.id = :eventId" +
            " AND f.organiser.username= :username")
    int isOwnerOfTheFest(UUID eventId, String username);

    @Query("select new com.testing.springpractice.festtracker.dataTranseferObjects.OrganiserDataTransferObjects.EntireFestDetails(" +
            " f.id," +
            "f.title," +
            "f.description," +
            "f.date," +
            "f.time," +
            "f.detailedAddress," +
            "f.duration," +
            "f.ageLimit," +
            "f.language," +
            "f.genre," +
            "f.bankAccountNumber," +
            "f.ifscCode," +
            "f.accountHolderName," +
            "f.paymentQrURL," +
            "f.posterUrl) from Fest f where f.id = :eventId")
    EntireFestDetails entireFestDetails(UUID eventId);

    @Query("select new com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.Receiver( b.user.username )" +
            "from Fest f " +
            "Inner Join Bookings b on f.id = b.fest.id where f.id = :eventId")
    List<Receiver> getUsernameOfUsers(UUID eventId);

    @Query(
            value = """
        SELECT
            f.id AS id,
            f.title AS title,
            f.description AS description,
            f.date AS date,
            f.time AS time,
            f.detailed_address AS detailedAddress,
            f.genre AS genre,
            f.language AS language,
            f.poster_url AS posterUrl
        FROM fest f
        WHERE f.active = true
          AND f.date >= CURRENT_DATE
          AND (
              6371 * acos(
                  cos(radians(:lat)) *
                  cos(radians(f.latitude)) *
                  cos(radians(f.longitude) - radians(:lng)) +
                  sin(radians(:lat)) *
                  sin(radians(f.latitude))
              )
          ) <= :radius
        ORDER BY (
            6371 * acos(
                cos(radians(:lat)) *
                cos(radians(f.latitude)) *
                cos(radians(f.longitude) - radians(:lng)) +
                sin(radians(:lat)) *
                sin(radians(f.latitude))
            )
        )
        """,

            countQuery = """
        SELECT COUNT(*)
        FROM fest f
        WHERE f.active = true
          AND f.date >= CURRENT_DATE
          AND (
              6371 * acos(
                  cos(radians(:lat)) *
                  cos(radians(f.latitude)) *
                  cos(radians(f.longitude) - radians(:lng)) +
                  sin(radians(:lat)) *
                  sin(radians(f.latitude))
              )
          ) <= :radius
        """,

            nativeQuery = true
    )
    Page<FestInformation> findNearbyEvents(
             double lat,
             double lng,
             double radius,
            Pageable pageable
    );

    @Query("select new com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects.FestInformationBrief(" +
            "f.id," +
            "f.organiser.name," +
            "f.title," +
            "f.description," +
            "f.date," +
            "f.time," +
            "f.detailedAddress," +
            "f.duration," +
            "f.ageLimit," +
            "f.language," +
            "f.genre," +
            "f.active," +
            "f.posterUrl) from Fest f where f.id = :eventId")
    FestInformationBrief getEventDetails(UUID eventId);
}
