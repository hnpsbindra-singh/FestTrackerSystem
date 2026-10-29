package com.testing.springpractice.festtracker.DataTranseferObjects.UserDataTransferObjects;
import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {
    @NotBlank(message = "Transaction ID is required")
    private String transactionId;
}