package com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects;

import com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.Receiver;

import java.util.List;

public record SendFestCancellationMailDTO(List<Receiver> mail, String title) {
}
