import api from '../api/axios';
import type { CreateShareRequest, ShareResponse, SharedPlan } from '../models/Share';
import type { CreateDestinationRequest, Destination } from '../models/Destination';
import type { CreateActivityRequest, Activity } from '../models/Activity';
import type { CreateChecklistItemRequest, ChecklistItem } from '../models/ChecklistItem';

export const shareService = {
  createShare: async (tripId: number, data: CreateShareRequest): Promise<ShareResponse> => {
    const response = await api.post<ShareResponse>(`/api/trips/${tripId}/share`, data);
    return response.data;
  },

  getSharedPlan: async (token: string): Promise<SharedPlan> => {
    const response = await api.get<SharedPlan>(`/api/shared/${token}`);
    return response.data;
  },

  // ===== EDIT operacije kroz share token (samo Edit nivo) =====

  // Destinations
  createDestination: (token: string, data: CreateDestinationRequest): Promise<Destination> =>
    api.post(`/api/shared/${token}/destinations`, data).then(r => r.data),
  updateDestination: (token: string, id: number, data: CreateDestinationRequest): Promise<Destination> =>
    api.put(`/api/shared/${token}/destinations/${id}`, data).then(r => r.data),
  deleteDestination: (token: string, id: number): Promise<void> =>
    api.delete(`/api/shared/${token}/destinations/${id}`).then(() => undefined),

  // Activities
  createActivity: (token: string, data: CreateActivityRequest): Promise<Activity> =>
    api.post(`/api/shared/${token}/activities`, data).then(r => r.data),
  updateActivity: (token: string, id: number, data: CreateActivityRequest): Promise<Activity> =>
    api.put(`/api/shared/${token}/activities/${id}`, data).then(r => r.data),
  deleteActivity: (token: string, id: number): Promise<void> =>
    api.delete(`/api/shared/${token}/activities/${id}`).then(() => undefined),

  // Checklist
  createChecklistItem: (token: string, data: CreateChecklistItemRequest): Promise<ChecklistItem> =>
    api.post(`/api/shared/${token}/checklist`, data).then(r => r.data),
  updateChecklistItem: (token: string, id: number, data: { name: string; isCompleted: boolean }): Promise<ChecklistItem> =>
    api.put(`/api/shared/${token}/checklist/${id}`, data).then(r => r.data),
  deleteChecklistItem: (token: string, id: number): Promise<void> =>
    api.delete(`/api/shared/${token}/checklist/${id}`).then(() => undefined),

  // Notes
  updateNotes: (token: string, generalNotes: string): Promise<void> =>
    api.put(`/api/shared/${token}/notes`, { generalNotes }).then(() => undefined),
};