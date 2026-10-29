package com.testing.springpractice.festtracker.dataTranseferObjects.UserDataTransferObjects;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public interface FestInformation {
    UUID getId();
    String getTitle();
    String getDescription();
    LocalDate getDate();
    LocalTime getTime();
    String getDetailedAddress();
    String getGenre();
    String getLanguage();
    String getPosterUrl();
}
