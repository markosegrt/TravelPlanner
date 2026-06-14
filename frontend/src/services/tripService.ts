import api from '../api/axios';
import type {
  Trip,
  TripDetail,
  CreateTripRequest,
  UpdateTripRequest,
} from '../models/Trip';

export const tripService = {
  getAll: async (): Promise<Trip[]> => {
    const response = await api.get<Trip[]>('/api/trips');
    return response.data;
  },

  getById: async (id: number): Promise<TripDetail> => {
    const response = await api.get<TripDetail>(`/api/trips/${id}`);
    return response.data;
  },

  create: async (data: CreateTripRequest): Promise<Trip> => {
    const response = await api.post<Trip>('/api/trips', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTripRequest): Promise<Trip> => {
    const response = await api.put<Trip>(`/api/trips/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/trips/${id}`);
  },
};