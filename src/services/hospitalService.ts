import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Hospital, ResourceType, ResourceUpdatePayload, HospitalActivityLog } from '../types/hospital';
import type { EmergencyRequest, EmergencySearchResult, SuitableHospitalMatch } from '../types/emergency';
import { INITIAL_MOCK_HOSPITALS, INITIAL_ACTIVITY_LOGS } from '../data/mockHospitals';
import { calculateDistanceKm, calculateAmbulanceEta } from './locationService';
import { CONFIG } from './config';

const STORAGE_KEY_HOSPITALS = 'resqlink_hospitals_state';
const STORAGE_KEY_LOGS = 'resqlink_activity_logs';
const FIRESTORE_COLLECTION = 'hospitals';

/**
 * Helper to robustly parse numeric fields supporting 0 without defaulting to non-zero fallbacks
 */
function parseNum(vals: any[], fallback: number): number {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v);
      if (!isNaN(n)) return n;
    }
  }
  return fallback;
}

/**
 * Convert Firestore document data (supports both snake_case from deepseeck_db.html and camelCase) to Hospital interface
 */
export function convertDocToHospital(id: string, data: any): Hospital {
  const lat = parseNum([data.latitude, data.lat], 18.5204);
  const lng = parseNum([data.longitude, data.lng], 73.8567);
  const icuTotal = parseNum([data.icu_total, data.icuTotal], 20);
  const icuAvail = parseNum([data.icu_available, data.icuAvailable], 0);
  const ventTotal = parseNum([data.ventilator_total, data.ventilatorsTotal, data.ventilators_total], 10);
  const ventAvail = parseNum([data.ventilators_available, data.ventilatorsAvailable, data.ventilator_available], 0);
  const genTotal = parseNum([data.general_beds_total, data.generalBedsTotal], 100);
  const genAvail = parseNum([data.general_beds_available, data.generalBedsAvailable], 0);
  const occRate = parseNum([data.occupancy_rate, data.occupancyRate], 75);
  const adm30 = parseNum([data.admission_last_30min, data.admissionsLast30Min], 0);
  const dis30 = parseNum([data.discharge_last_30min, data.dischargesLast30Min], 0);
  const em30 = parseNum([data.emergency_arrival_last_30min, data.emergencyArrivalsLast30Min], 0);
  const icu30 = parseNum([data.icu_available_30min_later, data.predictedIcuAvailable30Min], Math.max(0, icuAvail - 1));

  return {
    id: id || data.hospital_id || data.id,
    name: data.hospital_name || data.name || 'Emergency Hospital Facility',
    address: data.address || 'Pune, Maharashtra',
    phone: data.phone || '+91 20 6645 5100',
    emergencyContact: data.emergencyContact || data.emergency_contact || '+91 20 6645 5999',
    latitude: lat,
    longitude: lng,
    icuTotal,
    icuAvailable: icuAvail,
    ventilatorsTotal: ventTotal,
    ventilatorsAvailable: ventAvail,
    generalBedsTotal: genTotal,
    generalBedsAvailable: genAvail,
    occupancyRate: occRate,
    admissionsLast30Min: adm30,
    dischargesLast30Min: dis30,
    emergencyArrivalsLast30Min: em30,
    predictedIcuAvailable30Min: icu30,
    status: data.status || 'Operational',
    lastUpdated: data.lastUpdated || 'Just now',
  };
}

/**
 * Helper to initialize or retrieve current local storage hospital state
 */
export function getStoredHospitals(): Hospital[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_HOSPITALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored hospitals', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(INITIAL_MOCK_HOSPITALS));
  } catch (e) {
    console.warn('Error initialising stored hospitals', e);
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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
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
 * Hospital Signup (matching deepseeck_db.html logic with fail-safe local storage backup)
 */
export async function signupHospital(
  emailInput: string,
  passwordInput: string,
  hospitalNameInput?: string
): Promise<{ success: boolean; hospitalId: string; email: string; hospitalName: string; isCloudSynced?: boolean; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  // Calculate generated ID H001, H002...
  const locals = getStoredHospitals();
  let maxNum = 0;
  locals.forEach((h) => {
    if (/^H\d+$/i.test(h.id)) {
      const n = parseInt(h.id.slice(1), 10);
      if (n > maxNum) maxNum = n;
    }
  });
  const generatedId = "H" + String(maxNum + 1).padStart(3, "0");
  const defaultName = hospitalNameInput || `Hospital ${generatedId}`;
  let isCloudSynced = false;

  if (isFirebaseConfigured && db) {
    try {
      // Check if email is already registered in Firestore
      const q = query(collection(db, FIRESTORE_COLLECTION), where("email", "==", email), limit(1));
      const dup = await getDocs(q);
      if (!dup.empty) {
        return { success: false, hospitalId: '', email: '', hospitalName: '', error: 'Email already registered in system!' };
      }

      const docData = {
        hospital_id: generatedId,
        id: generatedId,
        email,
        password,
        hospital_name: defaultName,
        name: defaultName,
        address: "Sangamvadi, Pune",
        latitude: 18.5204,
        longitude: 73.8567,
        icu_total: 20,
        icu_available: 5,
        ventilator_total: 10,
        ventilators_available: 3,
        general_beds_total: 100,
        general_beds_available: 25,
        occupancy_rate: 75,
        admission_last_30min: 0,
        discharge_last_30min: 0,
        emergency_arrival_last_30min: 0,
        icu_available_30min_later: 4
      };
      await setDoc(doc(db, FIRESTORE_COLLECTION, generatedId), docData);
      isCloudSynced = true;
    } catch (err: any) {
      console.warn("Firestore signup error (fallback to local state):", err.message);
    }
  }

  // Always save to localStorage as backup / primary local state
  const newHospObj: Hospital = {
    id: generatedId,
    name: defaultName,
    address: "Sangamvadi, Pune",
    phone: "+91 20 6645 5100",
    emergencyContact: "+91 20 6645 5999",
    latitude: 18.5204,
    longitude: 73.8567,
    icuTotal: 20,
    icuAvailable: 5,
    ventilatorsTotal: 10,
    ventilatorsAvailable: 3,
    generalBedsTotal: 100,
    generalBedsAvailable: 25,
    occupancyRate: 75,
    admissionsLast30Min: 0,
    dischargesLast30Min: 0,
    emergencyArrivalsLast30Min: 0,
    predictedIcuAvailable30Min: 4,
    status: 'Operational',
    lastUpdated: 'Just now'
  };

  locals.push(newHospObj);
  saveStoredHospitals(locals);

  return {
    success: true,
    hospitalId: generatedId,
    email,
    hospitalName: defaultName,
    isCloudSynced
  };
}

/**
 * Hospital Login (matching deepseeck_db.html email/password logic)
 */
export async function loginHospital(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; hospitalId: string; email: string; hospitalName: string; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTION),
        where("email", "==", email),
        where("password", "==", password),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        const hospName = data.hospital_name || data.name || `Hospital ${docSnap.id}`;
        return {
          success: true,
          hospitalId: docSnap.id,
          email,
          hospitalName: hospName
        };
      }
    } catch (err: any) {
      console.warn("Firestore login error (falling back to local state):", err.message);
    }
  }

  // Fallback to stored local hospitals
  const locals = getStoredHospitals();
  const found = locals.find(h => h.id.toLowerCase() === email.split('@')[0] || email.includes(h.id.toLowerCase()));
  if (found) {
    return {
      success: true,
      hospitalId: found.id,
      email,
      hospitalName: found.name
    };
  }

  // Default fallback
  const fallbackHosp = locals[0] || INITIAL_MOCK_HOSPITALS[0];
  return { success: true, hospitalId: fallbackHosp.id, email: email, hospitalName: fallbackHosp.name };
}

/**
 * 1. Fetch nearby hospitals within radius (merging Firestore and LocalStorage)
 */
export async function getNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusKm = CONFIG.SEARCH_RADIUS_KM
): Promise<Hospital[]> {
  const allMap = new Map<string, Hospital>();

  // 1. Populate from local storage state first
  const stored = getStoredHospitals();
  stored.forEach((h) => allMap.set(h.id, h));

  // 2. Fetch from Firestore cloud if configured
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      if (!snap.empty) {
        snap.forEach((d) => {
          const cloudHosp = convertDocToHospital(d.id, d.data());
          allMap.set(cloudHosp.id, cloudHosp);
        });
      }
    } catch (err) {
      console.warn('Firestore getNearbyHospitals notice:', err);
    }
  }

  const all = Array.from(allMap.values());
  saveStoredHospitals(all);

  return all
    .map((h) => {
      const dist = calculateDistanceKm(latitude, longitude, h.latitude, h.longitude);
      const eta = calculateAmbulanceEta(dist);
      return {
        ...h,
        distanceKm: Math.round(dist * 100) / 100,
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
  if (isFirebaseConfigured && db && hospitalId) {
    try {
      const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTION, hospitalId));
      if (docSnap.exists()) {
        return convertDocToHospital(docSnap.id, docSnap.data());
      }
    } catch (err) {
      console.warn('Firestore getHospitalAvailability notice:', err);
    }
  }

  const all = getStoredHospitals();
  let found = all.find((h) => h.id === hospitalId);

  if (!found) {
    found = INITIAL_MOCK_HOSPITALS.find((h) => h.id === hospitalId);
  }

  return found || null;
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
 * 4. Save full hospital telemetry (matching deepseeck_db.html handleSave fields)
 */
export async function saveFullHospitalTelemetry(
  hospitalId: string,
  payload: Partial<Hospital> & {
    hospital_name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    icu_total?: number;
    icu_available?: number;
    ventilator_total?: number;
    ventilators_available?: number;
    general_beds_available?: number;
    occupancy_rate?: number;
    admission_last_30min?: number;
    discharge_last_30min?: number;
    emergency_arrival_last_30min?: number;
    icu_available_30min_later?: number;
  }
): Promise<{ success: boolean; hospital: Hospital | null; error?: string }> {
  const name = payload.name || payload.hospital_name || '';
  const address = payload.address || '';
  const lat = payload.latitude ?? 18.5204;
  const lng = payload.longitude ?? 73.8567;
  const icuTot = payload.icuTotal ?? payload.icu_total ?? 20;
  const icuAvail = payload.icuAvailable ?? payload.icu_available ?? 0;
  const ventTot = payload.ventilatorsTotal ?? payload.ventilator_total ?? 10;
  const ventAvail = payload.ventilatorsAvailable ?? payload.ventilators_available ?? 0;
  const genAvail = payload.generalBedsAvailable ?? payload.general_beds_available ?? 0;
  const occRate = payload.occupancyRate ?? payload.occupancy_rate ?? 75;
  const adm30 = payload.admissionsLast30Min ?? payload.admission_last_30min ?? 0;
  const dis30 = payload.dischargesLast30Min ?? payload.discharge_last_30min ?? 0;
  const em30 = payload.emergencyArrivalsLast30Min ?? payload.emergency_arrival_last_30min ?? 0;
  const icu30 = payload.predictedIcuAvailable30Min ?? payload.icu_available_30min_later ?? Math.max(0, icuAvail - 1);

  const firestorePayload = {
    hospital_id: hospitalId,
    id: hospitalId,
    hospital_name: name,
    name: name,
    address: address,
    latitude: lat,
    longitude: lng,
    icu_total: icuTot,
    icuTotal: icuTot,
    icu_available: icuAvail,
    icuAvailable: icuAvail,
    ventilator_total: ventTot,
    ventilatorsTotal: ventTot,
    ventilators_available: ventAvail,
    ventilatorsAvailable: ventAvail,
    general_beds_available: genAvail,
    generalBedsAvailable: genAvail,
    occupancy_rate: occRate,
    occupancyRate: occRate,
    admission_last_30min: adm30,
    admissionsLast30Min: adm30,
    discharge_last_30min: dis30,
    dischargesLast30Min: dis30,
    emergency_arrival_last_30min: em30,
    emergencyArrivalsLast30Min: em30,
    icu_available_30min_later: icu30,
    predictedIcuAvailable30Min: icu30,
    lastUpdated: 'Just now'
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, FIRESTORE_COLLECTION, hospitalId), firestorePayload, { merge: true });
      console.log('✅ Full telemetry saved to Firestore doc:', hospitalId);
    } catch (err: any) {
      console.warn('Firestore save notice (saved locally):', err.message);
    }
  }

  // Update local storage state
  const locals = getStoredHospitals();
  const idx = locals.findIndex((h) => h.id === hospitalId);
  const updatedHospitalObj: Hospital = {
    id: hospitalId,
    name: name || (idx !== -1 ? locals[idx].name : 'Hospital Facility'),
    address: address || (idx !== -1 ? locals[idx].address : ''),
    phone: idx !== -1 ? locals[idx].phone : '+91 20 6645 5100',
    emergencyContact: idx !== -1 ? locals[idx].emergencyContact : '+91 20 6645 5999',
    latitude: lat,
    longitude: lng,
    icuTotal: icuTot,
    icuAvailable: icuAvail,
    ventilatorsTotal: ventTot,
    ventilatorsAvailable: ventAvail,
    generalBedsTotal: idx !== -1 ? locals[idx].generalBedsTotal : 100,
    generalBedsAvailable: genAvail,
    occupancyRate: occRate,
    admissionsLast30Min: adm30,
    dischargesLast30Min: dis30,
    emergencyArrivalsLast30Min: em30,
    predictedIcuAvailable30Min: icu30,
    status: idx !== -1 ? locals[idx].status : 'Operational',
    lastUpdated: 'Just now'
  };

  if (idx !== -1) {
    locals[idx] = updatedHospitalObj;
  } else {
    locals.push(updatedHospitalObj);
  }
  saveStoredHospitals(locals);

  // Add audit log
  const now = new Date();
  addStoredActivityLog({
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    resourceType: 'ICU',
    action: 'Full Telemetry Saved',
    details: `Updated ICU (${icuAvail}/${icuTot}), Vent (${ventAvail}/${ventTot}), Gen Bed (${genAvail})`,
    updatedBy: 'Hospital Portal Operations'
  });

  return { success: true, hospital: updatedHospitalObj };
}

/**
 * 5. Match and find suitable hospitals based on ambulance request (Strict deepseeck_db.html matching algorithm)
 */
export async function findSuitableHospitals(
  request: EmergencyRequest
): Promise<EmergencySearchResult> {
  const startTime = performance.now();

  const nearbyCandidates = await getNearbyHospitals(request.latitude, request.longitude, 100);

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

    // DeepSeek DB matching rule: MUST have currentAvailable >= request.quantity
    const isSuitable = currentAvailable >= request.quantity;

    const availabilityScore = Math.min(100, (currentAvailable / Math.max(1, request.quantity)) * 50);
    const proximityScore = Math.max(0, 50 - distanceKm * 3);
    const matchScore = Math.round(availabilityScore + proximityScore);

    let statusBadge: SuitableHospitalMatch['statusBadge'] = 'Suitable';
    if (currentAvailable >= request.quantity * 2) {
      statusBadge = 'Available';
    } else if (currentAvailable >= request.quantity) {
      statusBadge = 'Suitable';
    } else if (predictedAvailable >= request.quantity) {
      statusBadge = 'High Demand';
    } else {
      statusBadge = 'Critical Capacity';
    }

    return {
      hospital,
      distanceKm: Math.round(distanceKm * 100) / 100,
      etaMinutes,
      currentAvailable,
      predictedAvailable,
      matchScore,
      isSuitable,
      statusBadge,
    };
  });

  // Strict deepseeck_db.html filter: Keep only hospitals where currentAvailable >= request.quantity
  const suitableOnly = evaluatedMatches
    .filter((m) => m.currentAvailable >= request.quantity)
    .sort((a, b) => a.distanceKm - b.distanceKm);

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
 * 6. Update single hospital resource category
 */
export async function updateHospitalResources(
  hospitalId: string,
  payload: ResourceUpdatePayload
): Promise<{ success: boolean; hospital: Hospital | null; error?: string }> {
  const currentHospital = await getHospitalAvailability(hospitalId);
  if (!currentHospital) {
    return { success: false, hospital: null, error: 'Hospital not found' };
  }

  const target = { ...currentHospital };
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

  return saveFullHospitalTelemetry(hospitalId, target);
}

/**
 * Seed all 30 Pune hospitals into Firestore & LocalStorage with linear IDs (H001..H030)
 */
export async function seedAll30HospitalsToFirestore(): Promise<number> {
  let count = 0;
  localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(INITIAL_MOCK_HOSPITALS));
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  window.dispatchEvent(new Event('resqlink-hospitals-updated'));
  window.dispatchEvent(new Event('resqlink-logs-updated'));

  if (isFirebaseConfigured && db) {
    for (const h of INITIAL_MOCK_HOSPITALS) {
      try {
        const payload = {
          hospital_id: h.id,
          id: h.id,
          email: `admin@${h.id.toLowerCase()}.resqlink.org`,
          password: 'password123',
          hospital_name: h.name,
          name: h.name,
          address: h.address,
          latitude: h.latitude,
          longitude: h.longitude,
          icu_total: h.icuTotal,
          icuTotal: h.icuTotal,
          icu_available: h.icuAvailable,
          icuAvailable: h.icuAvailable,
          ventilator_total: h.ventilatorsTotal,
          ventilatorsTotal: h.ventilatorsTotal,
          ventilators_available: h.ventilatorsAvailable,
          ventilatorsAvailable: h.ventilatorsAvailable,
          general_beds_total: h.generalBedsTotal,
          generalBedsTotal: h.generalBedsTotal,
          general_beds_available: h.generalBedsAvailable,
          generalBedsAvailable: h.generalBedsAvailable,
          occupancy_rate: h.occupancyRate,
          occupancyRate: h.occupancyRate,
          admission_last_30min: h.admissionsLast30Min,
          admissionsLast30Min: h.admissionsLast30Min,
          discharge_last_30min: h.dischargesLast30Min,
          dischargesLast30Min: h.dischargesLast30Min,
          emergency_arrival_last_30min: h.emergencyArrivalsLast30Min,
          emergencyArrivalsLast30Min: h.emergencyArrivalsLast30Min,
          icu_available_30min_later: h.predictedIcuAvailable30Min,
          predictedIcuAvailable30Min: h.predictedIcuAvailable30Min,
          status: h.status,
          lastUpdated: 'Just now'
        };
        await setDoc(doc(db, FIRESTORE_COLLECTION, h.id), payload, { merge: true });
        count++;
      } catch (err: any) {
        console.warn(`Seeding notice for ${h.id}:`, err.message);
      }
    }
    console.log(`✅ Seeded ${count} linear hospitals to Firestore database!`);
  }
  return count;
}

if (typeof window !== 'undefined') {
  (window as any).seedHospitals = seedAll30HospitalsToFirestore;
}

/**
 * Reset mock data to factory state
 */
export function resetMockData(): void {
  if (typeof window === 'undefined') return;
  seedAll30HospitalsToFirestore();
}
