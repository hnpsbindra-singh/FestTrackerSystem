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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FestTracker - Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">

            <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                <tr>
                    <td align="center">

                        <table width="100%%" cellpadding="0" cellspacing="0"
                               style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color: #111827; padding: 28px 35px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 0.5px;">
                                        FestTracker
                                    </h1>
                                    <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">
                                        Events. Experiences. Memories.
                                    </p>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 35px;">

                                    <h2 style="margin: 0 0 20px; font-size: 24px; color: #111827;">
                                        Verify your email
                                    </h2>

                                    <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.6;">
                                        Hello %s,
                                    </p>

                                    <p style="margin: 0 0 25px; font-size: 15px; line-height: 1.6; color: #4b5563;">
                                        Use the verification code below to verify your email address
                                        and complete your FestTracker registration.
                                    </p>

                                    <!-- OTP Box -->
                                    <table width="100%%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center"
                                                style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 10px; padding: 25px;">
                                                <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">
                                                    Verification Code
                                                </p>
                                                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111827;">
                                                    %s
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 25px 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                                        This verification code will expire in <strong>5 minutes</strong>.
                                        If you did not request this code, you can safely ignore this email.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 22px 35px; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                        This is an automated message from FestTracker.
                                    </p>
                                    <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                                        Please do not reply to this email.
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
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
