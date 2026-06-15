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

  downloadPdf: async (id: number, tripName: string): Promise<void> => {
    const response = await api.get(`/api/trips/${id}/report.pdf`, {
      responseType: 'blob',   // binarni fajl, ne JSON
    });

    // Kreiraj download link iz blob-a
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripName}-plan.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};