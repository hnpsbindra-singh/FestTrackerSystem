export interface FestInformation {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  detailedAddress: string;
  genre: string;
  language: string;
  posterUrl: string | null;
}

export interface FestInformationBrief {
  id: string;
  organiserName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  detailedAddress: string;
  duration: string;
  ageLimit: number;
  language: string;
  genre: string;
  active: boolean;
  posterUrl: string | null;
}

export interface SeatingDetails {
  id: string;
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

export interface SeatingTypeRequest {
  name: string;
  price: number;
  totalSeats: number;
}

export interface FestCreationRequest {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  detailedAddress: string;
  duration: string;
  ageLimit: number;
  language: string;
  genre: string;
  latitude: number;
  longitude: number;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  seatingTypeRequests: SeatingTypeRequest[];
}

export interface FestDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  detailedAddress: string;
  posterUrl: string | null;
}

export interface EntireFestDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  detailedAddress: string;
  duration: string;
  ageLimit: number;
  language: string;
  genre: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  paymentQrURL: string;
  posterUrl: string | null;
}
