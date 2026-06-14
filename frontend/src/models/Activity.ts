import { ActivityStatus } from './enums';

export interface Activity {
  id: number;
  name: string;
  date: string;
  time?: string;              
  location?: string;
  description?: string;
  estimatedCost: number;
  status: ActivityStatus;
  latitude?: number;
  longitude?: number;
  tripId: number;
  destinationId?: number;
}

export interface CreateActivityRequest {
  name: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  estimatedCost: number;
  status: ActivityStatus;
  latitude?: number;
  longitude?: number;
  destinationId?: number;
}

export interface UpdateActivityRequest {
  name: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  estimatedCost: number;
  status: ActivityStatus;
  latitude?: number;
  longitude?: number;
  destinationId?: number;
}