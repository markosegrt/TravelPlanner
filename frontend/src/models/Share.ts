import { AccessLevel } from './enums';
import type { TripDetail } from './Trip';

export interface CreateShareRequest {
  accessLevel: AccessLevel;
}

export interface ShareResponse {
  token: string;
  accessLevel: AccessLevel;
  shareUrl: string;
  qrCodeBase64: string;
}

export interface SharedPlan {
  accessLevel: AccessLevel;
  trip: TripDetail;
}