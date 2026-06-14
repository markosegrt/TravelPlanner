import type { Activity } from "./Activity";
import type { ChecklistItem } from "./ChecklistItem";
import type { Destination } from "./Destination";
import type { Expense } from "./Expense";


export interface Trip {
  id: number;
  name: string;
  description?: string;
  startDate: string;          
  endDate: string;
  plannedBudget: number;
  generalNotes?: string;
  destinationCount: number;
  totalSpent: number;
}

export interface TripDetail {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  generalNotes?: string;
  ownerUserId: number;
  destinations: Destination[];
  activities: Activity[];
  expenses: Expense[];
  checklistItems: ChecklistItem[];
  budgetSummary: BudgetSummary;
}

export interface CreateTripRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  generalNotes?: string;
}

export interface UpdateTripRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  generalNotes?: string;
}

export interface BudgetSummary {
  plannedBudget: number;
  totalSpent: number;
  remaining: number;
}