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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { Hospital, ResourceType, ResourceUpdatePayload, HospitalActivityLog } from '../types/hospital';
import type { EmergencyRequest, EmergencySearchResult, SuitableHospitalMatch } from '../types/emergency';
import { INITIAL_ACTIVITY_LOGS } from '../data/mockHospitals';
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
 * Convert Firestore document data (supports both snake_case and camelCase) to Hospital interface
 */
export function convertDocToHospital(id: string, data: any): Hospital {
  const lat = parseNum([data.latitude, data.lat], 18.5204);
  const lng = parseNum([data.longitude, data.lng], 73.8567);
  const icuTotal = parseNum([data.icu_total, data.icuTotal], 0);
  const icuAvail = parseNum([data.icu_available, data.icuAvailable], 0);
  const ventTotal = parseNum([data.ventilator_total, data.ventilatorsTotal, data.ventilators_total], 0);
  const ventAvail = parseNum([data.ventilators_available, data.ventilatorsAvailable, data.ventilator_available], 0);
  const genTotal = parseNum([data.general_beds_total, data.generalBedsTotal], 0);
  const genAvail = parseNum([data.general_beds_available, data.generalBedsAvailable], 0);
  const occRate = parseNum([data.occupancy_rate, data.occupancyRate], 0);
  const adm30 = parseNum([data.admission_last_30min, data.admissionsLast30Min], 0);
  const dis30 = parseNum([data.discharge_last_30min, data.dischargesLast30Min], 0);
  const em30 = parseNum([data.emergency_arrival_last_30min, data.emergencyArrivalsLast30Min], 0);
  const icu30 = parseNum([data.icu_available_30min_later, data.predictedIcuAvailable30Min], 0);

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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored hospitals', e);
  }
  return [];
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
      if (Array.isArray(parsed)) {
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
 * Hospital Signup:
 * 1. Generates strictly sequential serial ID (H001, H002, H003...) based on existing Firestore documents.
 * 2. Authenticates via Firebase Auth.
 * 3. Creates clean hospital entry with 0 pre-filled capacity until hospital manager inputs live data.
 */
export async function signupHospital(
  emailInput: string,
  passwordInput: string,
  hospitalNameInput?: string
): Promise<{ success: boolean; hospitalId: string; email: string; hospitalName: string; isCloudSynced?: boolean; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  // Compute sequential serial ID H001, H002, H003... directly from Firestore and LocalStorage
  let maxNum = 0;
  const locals = getStoredHospitals();
  locals.forEach((h) => {
    if (/^H\d+$/i.test(h.id)) {
      const n = parseInt(h.id.slice(1), 10);
      if (n > maxNum) maxNum = n;
    }
  });

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      snap.forEach((d) => {
        const id = d.id;
        if (/^H\d+$/i.test(id)) {
          const n = parseInt(id.slice(1), 10);
          if (n > maxNum) maxNum = n;
        }
      });
    } catch (err) {
      console.warn("Firestore serial ID check notice:", err);
    }
  }

  const generatedId = "H" + String(maxNum + 1).padStart(3, "0");
  const defaultName = hospitalNameInput?.trim() || `Hospital ${generatedId}`;
  let isCloudSynced = false;

  if (isFirebaseConfigured && auth && db) {
    try {
      // 1. Authenticate & create user in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Created Firebase Auth Account:", userCred.user.uid);

      // 2. Save clean hospital metadata in Firestore (0 pre-filled capacity until telemetry form saved)
      const docData = {
        hospital_id: generatedId,
        id: generatedId,
        uid: userCred.user.uid,
        email,
        hospital_name: defaultName,
        name: defaultName,
        address: "Pune, Maharashtra",
        latitude: 18.5204,
        longitude: 73.8567,
        icu_total: 0,
        icu_available: 0,
        ventilator_total: 0,
        ventilators_available: 0,
        general_beds_total: 0,
        general_beds_available: 0,
        occupancy_rate: 0,
        admission_last_30min: 0,
        discharge_last_30min: 0,
        emergency_arrival_last_30min: 0,
        icu_available_30min_later: 0
      };
      await setDoc(doc(db, FIRESTORE_COLLECTION, generatedId), docData);
      isCloudSynced = true;
    } catch (err: any) {
      console.warn("Firebase Auth / Firestore signup notice:", err.message);
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, hospitalId: '', email: '', hospitalName: '', error: 'Email already registered in Firebase Auth!' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, hospitalId: '', email: '', hospitalName: '', error: 'Password must be at least 6 characters long.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, hospitalId: '', email: '', hospitalName: '', error: 'Invalid email address.' };
      }
    }
  }

  // Save clean hospital state to local storage cache
  const newHospObj: Hospital = {
    id: generatedId,
    name: defaultName,
    address: "Pune, Maharashtra",
    phone: "+91 20 6645 5100",
    emergencyContact: "+91 20 6645 5999",
    latitude: 18.5204,
    longitude: 73.8567,
    icuTotal: 0,
    icuAvailable: 0,
    ventilatorsTotal: 0,
    ventilatorsAvailable: 0,
    generalBedsTotal: 0,
    generalBedsAvailable: 0,
    occupancyRate: 0,
    admissionsLast30Min: 0,
    dischargesLast30Min: 0,
    emergencyArrivalsLast30Min: 0,
    predictedIcuAvailable30Min: 0,
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
 * Hospital Login (using Firebase Authentication & Firestore doc matching)
 */
export async function loginHospital(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; hospitalId: string; email: string; hospitalName: string; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (isFirebaseConfigured && auth && db) {
    try {
      // 1. Authenticate credentials securely with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Authenticated with Firebase Auth:", email);

      // 2. Fetch hospital document from Firestore by email or ID
      const q = query(
        collection(db, FIRESTORE_COLLECTION),
        where("email", "==", email),
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
      console.warn("Firebase Auth login error:", err.message);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        return { success: false, hospitalId: '', email: '', hospitalName: '', error: 'Invalid email or password credentials.' };
      }
    }
  }

  // Local fallback if Firebase offline
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

  return { success: false, hospitalId: '', email: '', hospitalName: '', error: 'No matching hospital record found.' };
}

/**
 * 1. Fetch nearby hospitals within radius strictly from Firestore database
 */
export async function getNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusKm = CONFIG.SEARCH_RADIUS_KM
): Promise<Hospital[]> {
  const allMap = new Map<string, Hospital>();

  // 1. Fetch from Firestore cloud database
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

  // 2. Merge local storage state fallback
  if (allMap.size === 0) {
    const stored = getStoredHospitals();
    stored.forEach((h) => allMap.set(h.id, h));
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
 * 2. Fetch single hospital current resource availability from Firestore
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
  const found = all.find((h) => h.id === hospitalId);
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
 * 4. Save full hospital telemetry to Firestore database
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
    general_beds_total?: number;
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
  const icuTot = payload.icuTotal ?? payload.icu_total ?? 0;
  const icuAvail = payload.icuAvailable ?? payload.icu_available ?? 0;
  const ventTot = payload.ventilatorsTotal ?? payload.ventilator_total ?? 0;
  const ventAvail = payload.ventilatorsAvailable ?? payload.ventilators_available ?? 0;
  const genTot = payload.generalBedsTotal ?? payload.general_beds_total ?? 0;
  const genAvail = payload.generalBedsAvailable ?? payload.general_beds_available ?? 0;
  const occRate = payload.occupancyRate ?? payload.occupancy_rate ?? 0;
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
    general_beds_total: genTot,
    generalBedsTotal: genTot,
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
    generalBedsTotal: genTot,
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
 * 5. Match and find suitable hospitals based on live Firestore data
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
