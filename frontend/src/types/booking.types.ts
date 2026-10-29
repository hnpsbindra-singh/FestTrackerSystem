export type PaymentStatus = 'PAYMENT_PENDING' | 'PAYMENT_SUBMITTED' | 'PAYMENT_REJECTED';

export interface BookingInitiateRequest {
  festId: string;
  seatingTypeId: string;
  slots: number;
}

export interface BookingResponse {
  bookingId: string;
  totalCost: number;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  paymentQrURL: string;
}

export interface PaymentConfirmRequest {
  transactionId: string;
}

export interface UserBookingDetails {
  id: string;
  festTitle: string;
  festDate: string;
  festTime: string;
  detailedAddress: string;
  seatingName: string;
  slots: number;
  totalCost: number;
  paymentStatus: PaymentStatus;
  bookingKey: string | null;
  checkedIn: boolean;
}

export interface BookingDetails {
  id: string;
  customerName: string;
  customerUsername: string;
  customerMobile: string;
  seatingName: string;
  slots: number;
  totalCost: number;
  bookingDatetime: string;
  transactionId: string;
}
