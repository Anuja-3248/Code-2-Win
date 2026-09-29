export type ResourceType = 'ICU' | 'Ventilator' | 'General Bed';

export interface HospitalTelemetryRecord {
  hospital_id: string;
  date_time: string;

  // User Input Fields
  icu_available: number;
  icu_occupied: number;

  ventilator_available: number;
  ventilator_occupied: number;

  simple_beds_available: number;
  simple_beds_occupied: number;

  admissions_icu_30min: number;
  admissions_ventilator_30min: number;
  admissions_simple_beds_30min: number;

  discharges_icu_30min: number;
  discharges_ventilator_30min: number;
  discharges_simple_beds_30min: number;

  emergency_arrivals_30min: number;

  // System Calculated Fields
  icu_total: number;
  ventilator_total: number;
  simple_beds_total: number;

  icu_occupancy_rate: number;
  ventilator_occupancy_rate: number;
  simple_beds_occupancy_rate: number;

  icu_available_after_30min: number;
  ventilator_available_after_30min: number;
  simple_beds_available_after_30min: number;
}

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
  icuOccupied?: number;

  ventilatorsTotal: number;
  ventilatorsAvailable: number;
  ventilatorsOccupied?: number;

  generalBedsTotal: number;
  generalBedsAvailable: number;
  generalBedsOccupied?: number;
  
  // Emergency department dynamics
  occupancyRate: number; // percentage, e.g. 68.50
  icuOccupancyRate?: number;
  ventilatorOccupancyRate?: number;
  simpleBedsOccupancyRate?: number;

  admissionsLast30Min: number;
  dischargesLast30Min: number;
  emergencyArrivalsLast30Min: number;

  admissionsIcu30min?: number;
  admissionsVentilator30min?: number;
  admissionsSimpleBeds30min?: number;

  dischargesIcu30min?: number;
  dischargesVentilator30min?: number;
  dischargesSimpleBeds30min?: number;

  emergencyArrivals30min?: number;
  
  // Predictive metrics
  predictedIcuAvailable30Min: number;
  predictedVentilatorsAvailable30Min?: number;
  predictedGeneralBedsAvailable30Min?: number;
  
  // Status and metadata
  status: 'Operational' | 'Limited' | 'Diversion';
  lastUpdated: string;
  dateTimeSlot?: string;
  
  // Dynamically computed during search
  distanceKm?: number;
  etaMinutes?: number;
}

export interface ResourceUpdatePayload {
  resourceType: ResourceType;
  availableCount: number;
  occupiedCount?: number;
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
