import api from '../api/axios';
import type { User } from '../models/User';

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/api/admin/users');
    return response.data;
  },

  updateUserStatus: async (id: number, isActive: boolean): Promise<void> => {
    await api.put(`/api/admin/users/${id}`, { isActive });
  },
};