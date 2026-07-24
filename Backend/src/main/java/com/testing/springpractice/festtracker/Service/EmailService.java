package com.testing.springpractice.festtracker.Service;
import com.testing.springpractice.festtracker.DataTranseferObjects.EmailDataTransferObjects.EmailRequest;
import com.testing.springpractice.festtracker.DataTranseferObjects.EmailDataTransferObjects.Receiver;
import com.testing.springpractice.festtracker.DataTranseferObjects.EmailDataTransferObjects.Sender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class EmailService {
    private final RestTemplate restTemplate;
    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendOtp(String username, String name, String otp) {
        String subject = "Verify Your Email";

        String html = """
                <h2>Email Verification</h2>
                <p>Hello %s,</p>
                <p>Your OTP is:</p>
                <h1>%s</h1>
                <p>This OTP is valid for 5 minutes.</p>
                """.formatted(name, otp);
        Sender sender = Sender.builder()
                .name(senderName)
                .email(senderEmail)
                .build();
        Receiver receiver = Receiver.builder()
                .email(username)
                .build();
        EmailRequest request = EmailRequest.builder()
                .sender(sender)
                .to(List.of(receiver))
                .subject(subject)
                .htmlContent(html)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            System.out.println("Email sent successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    public void sendDeclineMessage(String username, String name, String title) {
        String subject = "Booking Declined";

        String html = """
                <h2>Dear %s</h2>
                <p>Your payment for %s has been declined</p>
                <p>any amount deducted will be soon refunded</p>
                <p>Team %s</p>
                """.formatted(name, title, title);
        Sender sender = Sender.builder()
                .name(senderName)
                .email(senderEmail)
                .build();
        Receiver receiver = Receiver.builder()
                .email(username)
                .build();
        EmailRequest request = EmailRequest.builder()
                .sender(sender)
                .to(List.of(receiver))
                .subject(subject)
                .htmlContent(html)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            System.out.println("Email sent successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    public void sendFestCancellationMail(List<Receiver> email, String title) {
        String subject = "Booking Declined";

        String html = """
                <h2>Dear user</h2>
                <p>Fest titled %s has been cancelled due to unavoidable reasons</p>
                <p>any amount deducted will be soon refunded</p>
                <p>Team %s</p>
                """.formatted(title, title);
        Sender sender = Sender.builder()
                .name(senderName)
                .email(senderEmail)
                .build();
        EmailRequest request = EmailRequest.builder()
                .sender(sender)
                .to(email)
                .subject(subject)
                .htmlContent(html)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            System.out.println("Email sent successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    public void sendBooking(String username, String name, String s) {
        String subject = "Booking Success!!!";

        String html = """
                <h2>Dear %s</h2>
                <p>Your Booking has been confirmed</p>
                <p>Any change of plans will be informed</p>
                <p>Your booking Key is</p>
                <h2>%s</h2>
                """.formatted(name, s);
        Sender sender = Sender.builder()
                .name(senderName)
                .email(senderEmail)
                .build();
        Receiver receiver = Receiver.builder()
                .email(username)
                .build();
        EmailRequest request = EmailRequest.builder()
                .sender(sender)
                .to(List.of(receiver))
                .subject(subject)
                .htmlContent(html)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            System.out.println("Email sent successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
