import api from '../api/axios';
import type {
  Destination,
  CreateDestinationRequest,
  UpdateDestinationRequest,
} from '../models/Destination';

export const destinationService = {
  getByTrip: async (tripId: number): Promise<Destination[]> => {
    const response = await api.get<Destination[]>(`/api/trips/${tripId}/destinations`);
    return response.data;
  },

  create: async (tripId: number, data: CreateDestinationRequest): Promise<Destination> => {
    const response = await api.post<Destination>(`/api/trips/${tripId}/destinations`, data);
    return response.data;
  },

  update: async (
    tripId: number,
    id: number,
    data: UpdateDestinationRequest
  ): Promise<Destination> => {
    const response = await api.put<Destination>(`/api/trips/${tripId}/destinations/${id}`, data);
    return response.data;
  },

  remove: async (tripId: number, id: number): Promise<void> => {
    await api.delete(`/api/trips/${tripId}/destinations/${id}`);
  },
};