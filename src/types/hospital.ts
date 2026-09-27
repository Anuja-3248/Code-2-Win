export type ResourceType = 'ICU' | 'Ventilator' | 'General Bed';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  emergencyContact: string;
  latitude: number;
  longitude: number;
  
  // Resource capacities & availability
  icuTotal: number;
  icuAvailable: number;
  ventilatorsTotal: number;
  ventilatorsAvailable: number;
  generalBedsTotal: number;
  generalBedsAvailable: number;
  
  // Emergency department dynamics
  occupancyRate: number; // percentage, e.g. 68
  admissionsLast30Min: number;
  dischargesLast30Min: number;
  emergencyArrivalsLast30Min: number;
  
  // Predictive metrics
  predictedIcuAvailable30Min: number;
  predictedVentilatorsAvailable30Min?: number;
  predictedGeneralBedsAvailable30Min?: number;
  
  // Status and metadata
  status: 'Operational' | 'Limited' | 'Diversion';
  lastUpdated: string; // ISO string or human-readable "2 mins ago"
  
  // Dynamically computed during search
  distanceKm?: number;
  etaMinutes?: number;
}

export interface ResourceUpdatePayload {
  resourceType: ResourceType;
  availableCount: number;
  updatedBy?: string;
  timestamp?: string;
}

export interface HospitalActivityLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  resourceType: ResourceType;
  action: string;
  details: string;
  updatedBy: string;
}
