export interface ChecklistItem {
  id: number;
  name: string;
  isCompleted: boolean;
  tripId: number;
}

export interface CreateChecklistItemRequest {
  name: string;
}

export interface UpdateChecklistItemRequest {
  name: string;
  isCompleted: boolean;
}