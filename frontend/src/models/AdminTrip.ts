export interface AdminTrip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  totalSpent: number;
  destinationCount: number;
  ownerUserId: number;
  ownerName: string;
  ownerEmail: string;
}