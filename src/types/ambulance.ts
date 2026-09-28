export type AmbulanceType = 'ALS' | 'BLS' | 'Patient Transport' | 'Neonatal';

export interface AmbulanceProfile {
  ambulanceId: string;       // e.g. "AMB-101"
  email: string;
  vehicleNumber: string;     // e.g. "MH12 AB 1234"
  driverName: string;
  driverPhone: string;
  ambulanceType: AmbulanceType;
  baseStation?: string;
  registeredAt: string;
}

export type PreAlertStatus = 'EN_ROUTE' | 'ACKNOWLEDGED' | 'ARRIVED' | 'CANCELLED';

export interface PreAlertPayload {
  id: string;
  ambulanceId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  ambulanceType: AmbulanceType;
  
  targetHospitalId: string;
  targetHospitalName: string;
  
  requiredResource: string;
  quantity: number;
  patientCondition: string;
  urgencyLevel: 'Critical' | 'Urgent' | 'Standard';
  
  originLocationName?: string;
  latitude: number;
  longitude: number;
  etaMinutes: number;
  distanceKm: number;
  
  status: PreAlertStatus;
  timestamp: string;
  acknowledgedAt?: string;
}
