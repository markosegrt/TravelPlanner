export interface Destination {
  id: number;
  name: string;
  location: string;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  tripId: number;
}

export interface CreateDestinationRequest {
  name: string;
  location: string;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDestinationRequest {
  name: string;
  location: string;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}