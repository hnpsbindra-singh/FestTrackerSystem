package com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private UUID bookingId;
    private Long totalCost;
    private String bankAccountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String paymentQrURL;
}