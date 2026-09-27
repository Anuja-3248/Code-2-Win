import type { Hospital, ResourceUpdatePayload } from '../types/hospital';
import type { EmergencyRequest, EmergencySearchResult } from '../types/emergency';
import * as hospitalService from './hospitalService';
import * as locationService from './locationService';

/**
 * Clean API Service Facade.
 * When Sarthak's backend is ready, developers can seamlessly switch `USE_MOCK_DATA = false`
 * and point endpoints directly to the database/REST endpoints.
 */
export const ApiService = {
  // Location & Geocoding
  async getLocation() {
    return locationService.getCurrentLocation();
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

  // Hospital activity audit trail
  async getActivityLogs() {
    return hospitalService.getStoredActivityLogs();
  },

  // Utility reset
  resetDemoData() {
    hospitalService.resetMockData();
  }
};
