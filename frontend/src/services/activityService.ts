import api from '../api/axios';
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '../models/Activity';

export const activityService = {
  getByTrip: async (tripId: number): Promise<Activity[]> => {
    const response = await api.get<Activity[]>(`/api/trips/${tripId}/activities`);
    return response.data;
  },

  create: async (tripId: number, data: CreateActivityRequest): Promise<Activity> => {
    const response = await api.post<Activity>(`/api/trips/${tripId}/activities`, data);
    return response.data;
  },

  update: async (
    tripId: number,
    id: number,
    data: UpdateActivityRequest
  ): Promise<Activity> => {
    const response = await api.put<Activity>(`/api/trips/${tripId}/activities/${id}`, data);
    return response.data;
  },

  remove: async (tripId: number, id: number): Promise<void> => {
    await api.delete(`/api/trips/${tripId}/activities/${id}`);
  },
};