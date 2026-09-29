import type { Hospital, ResourceUpdatePayload } from '../types/hospital';
import type { EmergencyRequest, EmergencySearchResult } from '../types/emergency';
import * as hospitalService from './hospitalService';
import * as locationService from './locationService';

/**
 * API Service Facade connecting directly to Firebase Firestore.
 */
export const ApiService = {
  // Location & Geocoding
  async getLocation() {
    return locationService.getCurrentLocation();
  },

  // Hospital Authentication & Signup (Firestore collection "hospitals")
  async signupHospital(email: string, password: string, hospitalName?: string) {
    return hospitalService.signupHospital(email, password, hospitalName);
  },

  async loginHospital(email: string, password: string) {
    return hospitalService.loginHospital(email, password);
  },

  // Hospital resource querying
  async fetchNearbyHospitals(lat: number, lng: number, radiusKm?: number): Promise<Hospital[]> {
    return hospitalService.getNearbyHospitals(lat, lng, radiusKm);
  },

  async fetchHospitalById(hospitalId: string): Promise<Hospital | null> {
    return hospitalService.getHospitalAvailability(hospitalId);
  },

  // Emergency matching algorithm
  async searchSuitableHospitals(request: EmergencyRequest): Promise<EmergencySearchResult> {
    return hospitalService.findSuitableHospitals(request);
  },

  // Hospital resource updates
  async updateAvailability(hospitalId: string, payload: ResourceUpdatePayload) {
    return hospitalService.updateHospitalResources(hospitalId, payload);
  },

  async saveFullHospitalTelemetry(hospitalId: string, payload: any) {
    return hospitalService.saveFullHospitalTelemetry(hospitalId, payload);
  },

  // Hospital activity audit trail
  async getActivityLogs() {
    return hospitalService.getStoredActivityLogs();
  }
};
