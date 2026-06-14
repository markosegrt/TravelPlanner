import api from '../api/axios';
import type { CreateShareRequest, ShareResponse, SharedPlan } from '../models/Share';

export const shareService = {
  createShare: async (tripId: number, data: CreateShareRequest): Promise<ShareResponse> => {
    const response = await api.post<ShareResponse>(`/api/trips/${tripId}/share`, data);
    return response.data;
  },

  getSharedPlan: async (token: string): Promise<SharedPlan> => {
    const response = await api.get<SharedPlan>(`/api/shared/${token}`);
    return response.data;
  },
};