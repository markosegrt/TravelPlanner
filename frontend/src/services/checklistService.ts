import api from '../api/axios';
import type {
  ChecklistItem,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
} from '../models/ChecklistItem';

export const checklistService = {
  getByTrip: async (tripId: number): Promise<ChecklistItem[]> => {
    const response = await api.get<ChecklistItem[]>(`/api/trips/${tripId}/checklist`);
    return response.data;
  },

  create: async (tripId: number, data: CreateChecklistItemRequest): Promise<ChecklistItem> => {
    const response = await api.post<ChecklistItem>(`/api/trips/${tripId}/checklist`, data);
    return response.data;
  },

  update: async (
    tripId: number,
    id: number,
    data: UpdateChecklistItemRequest
  ): Promise<ChecklistItem> => {
    const response = await api.put<ChecklistItem>(`/api/trips/${tripId}/checklist/${id}`, data);
    return response.data;
  },

  remove: async (tripId: number, id: number): Promise<void> => {
    await api.delete(`/api/trips/${tripId}/checklist/${id}`);
  },
};