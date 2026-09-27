import type { LocationCoordinates } from '../types/emergency';
import { CONFIG } from './config';

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Computes estimated ambulance travel time (ETA in minutes) with urban traffic factors
 */
export function calculateAmbulanceEta(distanceKm: number): number {
  const travelMinutes = (distanceKm / CONFIG.AVERAGE_AMBULANCE_SPEED_KMH) * 60;
  const totalEta = Math.max(3, Math.round(travelMinutes + 1.5));
  return totalEta;
}

/**
 * Obtains current location via browser Geolocation API with graceful fallback to mock coordinates
 */
export async function getCurrentLocation(): Promise<LocationCoordinates> {
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 30000,
        });
      });

      return {
        latitude: Math.round(position.coords.latitude * 10000) / 10000,
        longitude: Math.round(position.coords.longitude * 10000) / 10000,
        locationName: 'Detected GPS Location',
        accuracyMeters: Math.round(position.coords.accuracy),
      };
    } catch (err) {
      console.warn('Geolocation unavailable or denied, utilizing standard emergency coordinates.', err);
    }
  }

  // Fallback to designated emergency mock location (Pune center)
  return {
    latitude: CONFIG.DEFAULT_LOCATION.latitude,
    longitude: CONFIG.DEFAULT_LOCATION.longitude,
    locationName: CONFIG.DEFAULT_LOCATION.name,
    accuracyMeters: 10,
  };
}
