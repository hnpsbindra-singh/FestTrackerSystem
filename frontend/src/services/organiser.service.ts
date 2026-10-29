import { apiClient } from '@/lib/api-client';
import { SpringPage } from '@/types/common.types';
import {
  EntireFestDetails,
  FestCreationRequest,
  FestDetails,
  SeatingDetails,
} from '@/types/event.types';
import { BookingDetails } from '@/types/booking.types';

export const organiserService = {
  async addEvent(
    data: FestCreationRequest,
    paymentQr: File,
    poster?: File | null
  ): Promise<string> {
    const formData = new FormData();
    // Spring Boot @RequestPart("fest") requires application/json mime-type blob
    formData.append(
      'fest',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );
    formData.append('paymentQr', paymentQr);
    if (poster) {
      formData.append('poster', poster);
    }

    const response = await apiClient.post<string>('/api/organiser/addEvent', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async viewAllEvents(): Promise<FestDetails[]> {
    const response = await apiClient.get<FestDetails[]>('/api/organiser/view-my-events');
    return response.data;
  },

  async getEventDetails(eventId: string): Promise<EntireFestDetails> {
    const response = await apiClient.get<EntireFestDetails>(
      `/api/organiser/view-my-events/${eventId}`
    );
    return response.data;
  },

  async getSeatingDetails(eventId: string): Promise<SeatingDetails[]> {
    const response = await apiClient.get<SeatingDetails[]>(
      `/api/organiser/view-my-events/${eventId}/seats`
    );
    return response.data;
  },

  async getBookingDetails(
    eventId: string,
    page = 0,
    size = 10
  ): Promise<SpringPage<BookingDetails>> {
    const response = await apiClient.get<SpringPage<BookingDetails>>(
      `/api/organiser/view-my-events/${eventId}/bookings`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  async declineTicket(eventId: string, bookingId: string): Promise<string> {
    const response = await apiClient.patch<string>(
      `/api/organiser/view-my-events/${eventId}/${bookingId}/decline`
    );
    return response.data;
  },

  async cancelEvent(eventId: string): Promise<string> {
    const response = await apiClient.patch<string>(
      `/api/organiser/view-my-events/${eventId}/cancel`
    );
    return response.data;
  },

  async verifyTicket(eventId: string, bookingKey: string): Promise<string> {
    const response = await apiClient.get<string>(
      `/api/organiser/view-my-events/${eventId}/verify/${bookingKey.trim()}`
    );
    return response.data;
  },
};
