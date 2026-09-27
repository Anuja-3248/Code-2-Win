import type { Hospital, ResourceType } from './hospital';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  locationName: string;
  accuracyMeters?: number;
}

export interface EmergencyRequest {
  resource: ResourceType;
  quantity: number;
  latitude: number;
  longitude: number;
  locationName?: string;
  urgencyLevel?: 'Critical' | 'Urgent' | 'Standard';
  timestamp?: string;
}

export interface SuitableHospitalMatch {
  hospital: Hospital;
  distanceKm: number;
  etaMinutes: number;
  currentAvailable: number;
  predictedAvailable: number;
  matchScore: number;
  isSuitable: boolean;
  statusBadge: 'Suitable' | 'Available' | 'High Demand' | 'Critical Capacity';
}

export interface EmergencySearchResult {
  request: EmergencyRequest;
  totalCandidateHospitals: number;
  suitableHospitals: SuitableHospitalMatch[];
  searchTimestamp: string;
  executionTimeMs: number;
}
