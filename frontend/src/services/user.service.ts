import { apiClient } from '@/lib/api-client';
import { SpringPage } from '@/types/common.types';
import {
  FestInformation,
  FestInformationBrief,
  SeatingDetails,
} from '@/types/event.types';
import {
  BookingInitiateRequest,
  BookingResponse,
  PaymentConfirmRequest,
  UserBookingDetails,
} from '@/types/booking.types';

export interface FindEventsParams {
  latitude: number;
  longitude: number;
  page?: number;
  size?: number;
  radius?: number;
}

export const userService = {
  async findNearbyEvents(params: FindEventsParams): Promise<SpringPage<FestInformation>> {
    const response = await apiClient.get<SpringPage<FestInformation>>(
      '/api/user/find-Events-Nearby',
      {
        params: {
          latitude: params.latitude,
          longitude: params.longitude,
          page: params.page ?? 0,
          size: params.size ?? 10,
          radius: params.radius ?? 50,
        },
      }
    );
    return response.data;
  },

  async getEventDetails(eventId: string): Promise<FestInformationBrief> {
    const response = await apiClient.get<FestInformationBrief>(
      `/api/user/events/${eventId}`
    );
    return response.data;
  },

  async getSeatingDetails(eventId: string): Promise<SeatingDetails[]> {
    const response = await apiClient.get<SeatingDetails[]>(
      `/api/user/events/${eventId}/seating`
    );
    return response.data;
  },

  async initiateBooking(data: BookingInitiateRequest): Promise<BookingResponse> {
    const response = await apiClient.post<BookingResponse>(
      '/api/user/bookings/initiate',
      data
    );
    return response.data;
  },

  async confirmBooking(bookingId: string, data: PaymentConfirmRequest): Promise<string> {
    const response = await apiClient.post<string>(
      `/api/user/bookings/${bookingId}/confirm`,
      data
    );
    return response.data;
  },

  async getBookingsHistory(page = 0, size = 10): Promise<SpringPage<UserBookingDetails>> {
    const response = await apiClient.get<SpringPage<UserBookingDetails>>(
      '/api/user/bookings',
      {
        params: { page, size },
      }
    );
    return response.data;
  },
};
