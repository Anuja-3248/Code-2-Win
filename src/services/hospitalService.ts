import type { Hospital, ResourceType, ResourceUpdatePayload, HospitalActivityLog } from '../types/hospital';
import type { EmergencyRequest, EmergencySearchResult, SuitableHospitalMatch } from '../types/emergency';
import { INITIAL_MOCK_HOSPITALS, INITIAL_ACTIVITY_LOGS } from '../data/mockHospitals';
import { calculateDistanceKm, calculateAmbulanceEta } from './locationService';
import { CONFIG } from './config';

const STORAGE_KEY_HOSPITALS = 'resqlink_hospitals_state';
const STORAGE_KEY_LOGS = 'resqlink_activity_logs';

/**
 * Helper to initialize or retrieve current in-memory / local storage hospital state
 */
export function getStoredHospitals(): Hospital[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_HOSPITALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored hospitals', e);
  }
  return INITIAL_MOCK_HOSPITALS;
}

export function saveStoredHospitals(hospitals: Hospital[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
    window.dispatchEvent(new Event('resqlink-hospitals-updated'));
  } catch (e) {
    console.warn('Error saving hospitals', e);
  }
}

export function getStoredActivityLogs(): HospitalActivityLog[] {
  if (typeof window === 'undefined') return INITIAL_ACTIVITY_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored logs', e);
  }
  return INITIAL_ACTIVITY_LOGS;
}

export function addStoredActivityLog(log: HospitalActivityLog): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredActivityLogs();
    const updated = [log, ...current];
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated.slice(0, 30)));
    window.dispatchEvent(new Event('resqlink-logs-updated'));
  } catch (e) {
    console.warn('Error adding log', e);
  }
}

/**
 * 1. Fetch nearby hospitals within radius
 */
export async function getNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusKm = CONFIG.SEARCH_RADIUS_KM
): Promise<Hospital[]> {
  const all = getStoredHospitals();
  return all
    .map((h) => {
      const dist = calculateDistanceKm(latitude, longitude, h.latitude, h.longitude);
      const eta = calculateAmbulanceEta(dist);
      return {
        ...h,
        distanceKm: dist,
        etaMinutes: eta,
      };
    })
    .filter((h) => (h.distanceKm ?? 0) <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}

/**
 * 2. Fetch single hospital current resource availability
 */
export async function getHospitalAvailability(hospitalId: string): Promise<Hospital | null> {
  const all = getStoredHospitals();
  return all.find((h) => h.id === hospitalId) || null;
}

/**
 * 3. Predict hospital resource availability in 30 minutes
 */
export async function predictHospitalAvailability(
  hospitalId: string,
  resourceType: ResourceType
): Promise<number> {
  const hospital = await getHospitalAvailability(hospitalId);
  if (!hospital) return 0;

  if (resourceType === 'ICU') {
    return hospital.predictedIcuAvailable30Min ?? Math.max(0, hospital.icuAvailable - 1);
  }
  if (resourceType === 'Ventilator') {
    return hospital.predictedVentilatorsAvailable30Min ?? Math.max(0, hospital.ventilatorsAvailable - 1);
  }
  return hospital.predictedGeneralBedsAvailable30Min ?? Math.max(0, hospital.generalBedsAvailable - 2);
}

/**
 * 4. Match and find suitable hospitals based on ambulance request
 */
export async function findSuitableHospitals(
  request: EmergencyRequest
): Promise<EmergencySearchResult> {
  const startTime = performance.now();

  // Simulate server candidate processing pipeline
  const nearbyCandidates = await getNearbyHospitals(request.latitude, request.longitude, 30);

  const evaluatedMatches: SuitableHospitalMatch[] = nearbyCandidates.map((hospital) => {
    let currentAvailable = 0;
    let predictedAvailable = 0;

    switch (request.resource) {
      case 'ICU':
        currentAvailable = hospital.icuAvailable;
        predictedAvailable = hospital.predictedIcuAvailable30Min ?? Math.max(0, currentAvailable - 1);
        break;
      case 'Ventilator':
        currentAvailable = hospital.ventilatorsAvailable;
        predictedAvailable = hospital.predictedVentilatorsAvailable30Min ?? Math.max(0, currentAvailable - 1);
        break;
      case 'General Bed':
        currentAvailable = hospital.generalBedsAvailable;
        predictedAvailable = hospital.predictedGeneralBedsAvailable30Min ?? Math.max(0, currentAvailable - 2);
        break;
    }

    const distanceKm = hospital.distanceKm ?? calculateDistanceKm(request.latitude, request.longitude, hospital.latitude, hospital.longitude);
    const etaMinutes = hospital.etaMinutes ?? calculateAmbulanceEta(distanceKm);

    // Suitability logic: Has enough beds right now OR predicted capacity + distance proximity score
    const hasEnoughCurrent = currentAvailable >= request.quantity;
    const hasEnoughPredicted = predictedAvailable >= request.quantity;
    const isSuitable = hasEnoughCurrent || (hasEnoughPredicted && currentAvailable > 0);

    const availabilityScore = Math.min(100, (currentAvailable / Math.max(1, request.quantity)) * 50);
    const proximityScore = Math.max(0, 50 - distanceKm * 3);
    const matchScore = Math.round(availabilityScore + proximityScore);

    let statusBadge: SuitableHospitalMatch['statusBadge'] = 'Suitable';
    if (hasEnoughCurrent && currentAvailable >= request.quantity * 2) {
      statusBadge = 'Available';
    } else if (hasEnoughCurrent) {
      statusBadge = 'Suitable';
    } else if (hasEnoughPredicted) {
      statusBadge = 'High Demand';
    } else {
      statusBadge = 'Critical Capacity';
    }

    return {
      hospital,
      distanceKm,
      etaMinutes,
      currentAvailable,
      predictedAvailable,
      matchScore,
      isSuitable,
      statusBadge,
    };
  });

  // Filter candidates that meet the criteria and sort by optimal score
  const suitableOnly = evaluatedMatches
    .filter((m) => m.isSuitable && m.currentAvailable > 0)
    .sort((a, b) => {
      const aImmediate = a.currentAvailable >= request.quantity ? 1 : 0;
      const bImmediate = b.currentAvailable >= request.quantity ? 1 : 0;
      if (aImmediate !== bImmediate) {
        return bImmediate - aImmediate;
      }
      return a.etaMinutes - b.etaMinutes;
    });

  // Top 3 recommendation guarantee
  const topRecommendations = suitableOnly.slice(0, 3);

  const endTime = performance.now();

  return {
    request,
    totalCandidateHospitals: nearbyCandidates.length,
    suitableHospitals: topRecommendations,
    searchTimestamp: new Date().toISOString(),
    executionTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * 5. Update hospital resource availability (Hospital Portal)
 */
export async function updateHospitalResources(
  hospitalId: string,
  payload: ResourceUpdatePayload
): Promise<{ success: boolean; hospital: Hospital | null; error?: string }> {
  const all = getStoredHospitals();
  const index = all.findIndex((h) => h.id === hospitalId);

  if (index === -1) {
    return { success: false, hospital: null, error: 'Hospital not found' };
  }

  const target = { ...all[index] };
  const prevCount =
    payload.resourceType === 'ICU'
      ? target.icuAvailable
      : payload.resourceType === 'Ventilator'
      ? target.ventilatorsAvailable
      : target.generalBedsAvailable;

  if (payload.resourceType === 'ICU') {
    target.icuAvailable = Math.max(0, payload.availableCount);
    target.predictedIcuAvailable30Min = Math.max(0, payload.availableCount - 1);
  } else if (payload.resourceType === 'Ventilator') {
    target.ventilatorsAvailable = Math.max(0, payload.availableCount);
    target.predictedVentilatorsAvailable30Min = Math.max(0, payload.availableCount - 1);
  } else if (payload.resourceType === 'General Bed') {
    target.generalBedsAvailable = Math.max(0, payload.availableCount);
    target.predictedGeneralBedsAvailable30Min = Math.max(0, payload.availableCount - 2);
  }

  // Recalculate occupancy rate
  const totalBeds = target.icuTotal + target.generalBedsTotal;
  const occupiedBeds = (target.icuTotal - target.icuAvailable) + (target.generalBedsTotal - target.generalBedsAvailable);
  target.occupancyRate = Math.min(100, Math.round((occupiedBeds / totalBeds) * 100));
  target.lastUpdated = 'Just now';

  all[index] = target;
  saveStoredHospitals(all);

  // Add activity log
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newLog: HospitalActivityLog = {
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    timeFormatted,
    resourceType: payload.resourceType,
    action: `${payload.resourceType} Availability Updated`,
    details: `${payload.resourceType} availability adjusted from ${prevCount} to ${payload.availableCount} units`,
    updatedBy: payload.updatedBy || 'Hospital Operations Staff',
  };
  addStoredActivityLog(newLog);

  return { success: true, hospital: target };
}

/**
 * Reset mock data to factory state
 */
export function resetMockData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(INITIAL_MOCK_HOSPITALS));
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  window.dispatchEvent(new Event('resqlink-hospitals-updated'));
  window.dispatchEvent(new Event('resqlink-logs-updated'));
}
