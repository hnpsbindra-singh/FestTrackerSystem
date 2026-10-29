package com.testing.springpractice.festtracker.service;

import com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.EmailRequest;
import com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.Receiver;
import com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects.Sender;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.DeclineTicketMessageDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.OtpKafkaDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.SendBookingDTO;
import com.testing.springpractice.festtracker.dataTranseferObjects.KafkaDataTransferObjects.SendFestCancellationMailDTO;
import org.springframework.http.*;

import java.util.List;

public interface MessagingService {
        void sendOtp(OtpKafkaDTO otpKafkaDTO);
        void sendDeclineMessage(DeclineTicketMessageDTO declineTicketMessageDTO);
        void sendFestCancellationMail(SendFestCancellationMailDTO sendFestCancellationMailDTO);
        void sendBooking(SendBookingDTO sendBookingDTO);
}
