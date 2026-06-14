import { ExpenseCategory } from './enums';

export interface Expense {
  id: number;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  tripId: number;
}

export interface CreateExpenseRequest {
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
}

export interface UpdateExpenseRequest {
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
}