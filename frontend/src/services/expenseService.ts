import api from '../api/axios';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../models/Expense';
import type { BudgetSummary } from '../models/Trip';

export const expenseService = {
  getByTrip: async (tripId: number): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(`/api/trips/${tripId}/expenses`);
    return response.data;
  },

  create: async (tripId: number, data: CreateExpenseRequest): Promise<Expense> => {
    const response = await api.post<Expense>(`/api/trips/${tripId}/expenses`, data);
    return response.data;
  },

  update: async (
    tripId: number,
    id: number,
    data: UpdateExpenseRequest
  ): Promise<Expense> => {
    const response = await api.put<Expense>(`/api/trips/${tripId}/expenses/${id}`, data);
    return response.data;
  },

  remove: async (tripId: number, id: number): Promise<void> => {
    await api.delete(`/api/trips/${tripId}/expenses/${id}`);
  },

  getBudgetSummary: async (tripId: number): Promise<BudgetSummary> => {
    const response = await api.get<BudgetSummary>(`/api/trips/${tripId}/budget-summary`);
    return response.data;
  },
};