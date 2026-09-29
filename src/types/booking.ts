export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ADMITTED' | 'CANCELLED';

export type UrgencyLevel = 'Critical' | 'Urgent' | 'Standard';

export interface EmergencyBooking {
  id: string;
  ambulanceId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  ambulanceType: string;
  
  targetHospitalId: string;
  targetHospitalName: string;
  targetHospitalAddress?: string;
  targetHospitalPhone?: string;
  
  patientName?: string;
  patientAge?: number | string;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientCondition?: string;
  urgencyLevel: UrgencyLevel;
  
  requiredResource: 'ICU' | 'Ventilator' | 'General Bed' | string;
  quantity: number;
  
  etaMinutes: number;
  distanceKm: number;
  originLocationName?: string;
  
  status: BookingStatus;
  allocatedBay?: string;
  attendingDoctor?: string;
  hospitalNotes?: string;
  declineReason?: string;
  
  createdAt: string;
  acceptedAt?: string;
  admittedAt?: string;
}

export interface CreateBookingInput {
  targetHospitalId: string;
  targetHospitalName: string;
  targetHospitalAddress?: string;
  targetHospitalPhone?: string;
  requiredResource: string;
  quantity: number;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientCondition?: string;
  urgencyLevel?: UrgencyLevel;
  etaMinutes?: number;
  distanceKm?: number;
  originLocationName?: string;
}

export interface AcceptBookingPayload {
  allocatedBay?: string;
  attendingDoctor?: string;
  hospitalNotes?: string;
}
