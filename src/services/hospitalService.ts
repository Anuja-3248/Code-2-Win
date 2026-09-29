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
import type { Hospital, ResourceType, ResourceUpdatePayload, HospitalActivityLog, HospitalTelemetryRecord } from '../types/hospital';
import type { EmergencyRequest, EmergencySearchResult, SuitableHospitalMatch } from '../types/emergency';
import { INITIAL_ACTIVITY_LOGS } from '../data/mockHospitals';
import { calculateDistanceKm, calculateAmbulanceEta } from './locationService';
import { CONFIG } from './config';

const STORAGE_KEY_HOSPITALS = 'resqlink_hospitals_state';
const STORAGE_KEY_LOGS = 'resqlink_activity_logs';
const FIRESTORE_COLLECTION = 'hospitals';
const FIRESTORE_HISTORY_COLLECTION = 'telemetry_history';

/**
 * Robust helper to parse numeric fields supporting 0
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
 * Computes 30-minute interval slot key string, e.g. "2026-09-29 10:00"
 */
export function get30MinSlotKey(dateObj = new Date()): string {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hours = dateObj.getHours();
  const mins = dateObj.getMinutes() >= 30 ? 30 : 0;
  const hhStr = String(hours).padStart(2, '0');
  const mmStr = String(mins).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hhStr}:${mmStr}`;
}

/**
 * Calculates auto-computed metrics according to exact user specification
 */
export function calculateTelemetryMetrics(input: {
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
}) {
  const icu_available = Math.max(0, input.icu_available);
  const icu_occupied = Math.max(0, input.icu_occupied);
  const ventilator_available = Math.max(0, input.ventilator_available);
  const ventilator_occupied = Math.max(0, input.ventilator_occupied);
  const simple_beds_available = Math.max(0, input.simple_beds_available);
  const simple_beds_occupied = Math.max(0, input.simple_beds_occupied);

  const admissions_icu_30min = Math.max(0, input.admissions_icu_30min);
  const admissions_ventilator_30min = Math.max(0, input.admissions_ventilator_30min);
  const admissions_simple_beds_30min = Math.max(0, input.admissions_simple_beds_30min);

  const discharges_icu_30min = Math.max(0, input.discharges_icu_30min);
  const discharges_ventilator_30min = Math.max(0, input.discharges_ventilator_30min);
  const discharges_simple_beds_30min = Math.max(0, input.discharges_simple_beds_30min);

  // Totals
  const icu_total = icu_available + icu_occupied;
  const ventilator_total = ventilator_available + ventilator_occupied;
  const simple_beds_total = simple_beds_available + simple_beds_occupied;

  // Occupancy Rates (rounded to 2 decimal places)
  const icu_occupancy_rate = icu_total > 0 ? Number(((icu_occupied / icu_total) * 100).toFixed(2)) : 0;
  const ventilator_occupancy_rate = ventilator_total > 0 ? Number(((ventilator_occupied / ventilator_total) * 100).toFixed(2)) : 0;
  const simple_beds_occupancy_rate = simple_beds_total > 0 ? Number(((simple_beds_occupied / simple_beds_total) * 100).toFixed(2)) : 0;

  // 30-min Availability After
  const icu_available_after_30min = Math.max(0, icu_available + discharges_icu_30min - admissions_icu_30min);
  const ventilator_available_after_30min = Math.max(0, ventilator_available + discharges_ventilator_30min - admissions_ventilator_30min);
  const simple_beds_available_after_30min = Math.max(0, simple_beds_available + discharges_simple_beds_30min - admissions_simple_beds_30min);

  return {
    icu_total,
    ventilator_total,
    simple_beds_total,
    icu_occupancy_rate,
    ventilator_occupancy_rate,
    simple_beds_occupancy_rate,
    icu_available_after_30min,
    ventilator_available_after_30min,
    simple_beds_available_after_30min,
  };
}

/**
 * Validate input fields according to system constraints
 */
export function validateTelemetryInputs(input: {
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
}): { isValid: boolean; error?: string } {
  if (
    input.icu_available < 0 ||
    input.icu_occupied < 0 ||
    input.ventilator_available < 0 ||
    input.ventilator_occupied < 0 ||
    input.simple_beds_available < 0 ||
    input.simple_beds_occupied < 0
  ) {
    return { isValid: false, error: 'All resource counts (Available & Occupied) must be greater than or equal to 0.' };
  }

  if (
    input.admissions_icu_30min < 0 ||
    input.admissions_ventilator_30min < 0 ||
    input.admissions_simple_beds_30min < 0 ||
    input.discharges_icu_30min < 0 ||
    input.discharges_ventilator_30min < 0 ||
    input.discharges_simple_beds_30min < 0 ||
    input.emergency_arrivals_30min < 0
  ) {
    return { isValid: false, error: 'Admissions, discharges, and emergency arrivals must be greater than or equal to 0.' };
  }

  return { isValid: true };
}

/**
 * Convert Firestore document data to Hospital interface
 */
export function convertDocToHospital(id: string, data: any): Hospital {
  const lat = parseNum([data.latitude, data.lat], 18.5204);
  const lng = parseNum([data.longitude, data.lng], 73.8567);

  const icuAvail = parseNum([data.icu_available, data.icuAvailable], 0);
  const icuOcc = parseNum([data.icu_occupied, data.icuOccupied], 0);

  const ventAvail = parseNum([data.ventilator_available, data.ventilators_available, data.ventilatorsAvailable], 0);
  const ventOcc = parseNum([data.ventilator_occupied, data.ventilatorsOccupied], 0);

  const genAvail = parseNum([data.simple_beds_available, data.general_beds_available, data.generalBedsAvailable], 0);
  const genOcc = parseNum([data.simple_beds_occupied, data.generalBedsOccupied], 0);

  const admIcu = parseNum([data.admissions_icu_30min, data.admission_last_30min, data.admissionsLast30Min], 0);
  const admVent = parseNum([data.admissions_ventilator_30min], 0);
  const admBed = parseNum([data.admissions_simple_beds_30min], 0);

  const disIcu = parseNum([data.discharges_icu_30min, data.discharge_last_30min, data.dischargesLast30Min], 0);
  const disVent = parseNum([data.discharges_ventilator_30min], 0);
  const disBed = parseNum([data.discharges_simple_beds_30min], 0);

  const em30 = parseNum([data.emergency_arrivals_30min, data.emergency_arrival_last_30min, data.emergencyArrivalsLast30Min], 0);

  const computed = calculateTelemetryMetrics({
    icu_available: icuAvail,
    icu_occupied: icuOcc,
    ventilator_available: ventAvail,
    ventilator_occupied: ventOcc,
    simple_beds_available: genAvail,
    simple_beds_occupied: genOcc,
    admissions_icu_30min: admIcu,
    admissions_ventilator_30min: admVent,
    admissions_simple_beds_30min: admBed,
    discharges_icu_30min: disIcu,
    discharges_ventilator_30min: disVent,
    discharges_simple_beds_30min: disBed,
    emergency_arrivals_30min: em30
  });

  const slotKey = data.date_time || data.dateTimeSlot || get30MinSlotKey();

  return {
    id: id || data.hospital_id || data.id,
    name: data.hospital_name || data.name || 'Emergency Hospital Facility',
    address: data.address || 'Pune, Maharashtra',
    phone: data.phone || '+91 20 6645 5100',
    emergencyContact: data.emergencyContact || data.emergency_contact || '+91 20 6645 5999',
    latitude: lat,
    longitude: lng,

    icuTotal: computed.icu_total,
    icuAvailable: icuAvail,
    icuOccupied: icuOcc,

    ventilatorsTotal: computed.ventilator_total,
    ventilatorsAvailable: ventAvail,
    ventilatorsOccupied: ventOcc,

    generalBedsTotal: computed.simple_beds_total,
    generalBedsAvailable: genAvail,
    generalBedsOccupied: genOcc,

    occupancyRate: computed.icu_occupancy_rate,
    icuOccupancyRate: computed.icu_occupancy_rate,
    ventilatorOccupancyRate: computed.ventilator_occupancy_rate,
    simpleBedsOccupancyRate: computed.simple_beds_occupancy_rate,

    admissionsLast30Min: admIcu,
    dischargesLast30Min: disIcu,
    emergencyArrivalsLast30Min: em30,

    admissionsIcu30min: admIcu,
    admissionsVentilator30min: admVent,
    admissionsSimpleBeds30min: admBed,

    dischargesIcu30min: disIcu,
    dischargesVentilator30min: disVent,
    dischargesSimpleBeds30min: disBed,

    emergencyArrivals30min: em30,

    predictedIcuAvailable30Min: computed.icu_available_after_30min,
    predictedVentilatorsAvailable30Min: computed.ventilator_available_after_30min,
    predictedGeneralBedsAvailable30Min: computed.simple_beds_available_after_30min,

    status: data.status || 'Operational',
    lastUpdated: data.lastUpdated || 'Just now',
    dateTimeSlot: slotKey
  };
}

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
    if (hospitals.length === 0) {
      localStorage.removeItem(STORAGE_KEY_HOSPITALS);
    } else {
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
    }
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
 * Generates strictly sequential serial ID (H001, H002, H003...) from Firestore documents.
 */
export async function signupHospital(
  emailInput: string,
  passwordInput: string,
  hospitalNameInput?: string,
  addressInput?: string
): Promise<{ success: boolean; hospitalId: string; email: string; hospitalName: string; isCloudSynced?: boolean; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;
  const address = addressInput?.trim() || "Pune, Maharashtra";

  let maxNum = 0;
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
  } else {
    const locals = getStoredHospitals();
    locals.forEach((h) => {
      if (/^H\d+$/i.test(h.id)) {
        const n = parseInt(h.id.slice(1), 10);
        if (n > maxNum) maxNum = n;
      }
    });
  }

  const generatedId = "H" + String(maxNum + 1).padStart(3, "0");
  const defaultName = hospitalNameInput?.trim() || `Hospital ${generatedId}`;
  let isCloudSynced = false;
  const currentSlotKey = get30MinSlotKey();

  if (isFirebaseConfigured && auth && db) {
    try {
      // 1. Authenticate & create user in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Created Firebase Auth Account:", userCred.user.uid);

      // 2. Save clean initial hospital record in Firestore with 0 values
      const initialRecord: HospitalTelemetryRecord = {
        hospital_id: generatedId,
        date_time: currentSlotKey,
        icu_available: 0,
        icu_occupied: 0,
        ventilator_available: 0,
        ventilator_occupied: 0,
        simple_beds_available: 0,
        simple_beds_occupied: 0,
        admissions_icu_30min: 0,
        admissions_ventilator_30min: 0,
        admissions_simple_beds_30min: 0,
        discharges_icu_30min: 0,
        discharges_ventilator_30min: 0,
        discharges_simple_beds_30min: 0,
        emergency_arrivals_30min: 0,

        icu_total: 0,
        ventilator_total: 0,
        simple_beds_total: 0,

        icu_occupancy_rate: 0,
        ventilator_occupancy_rate: 0,
        simple_beds_occupancy_rate: 0,

        icu_available_after_30min: 0,
        ventilator_available_after_30min: 0,
        simple_beds_available_after_30min: 0
      };

      const docData = {
        ...initialRecord,
        id: generatedId,
        uid: userCred.user.uid,
        email,
        hospital_name: defaultName,
        name: defaultName,
        address: address,
        latitude: 18.5204,
        longitude: 73.8567,
        lastUpdated: 'Just now'
      };

      await setDoc(doc(db, FIRESTORE_COLLECTION, generatedId), docData);

      // Save to subcollection history document
      const cleanSlotId = currentSlotKey.replace(/[: ]/g, '_');
      await setDoc(doc(db, FIRESTORE_COLLECTION, generatedId, 'history', cleanSlotId), initialRecord);
      await setDoc(doc(db, FIRESTORE_HISTORY_COLLECTION, `${generatedId}_${cleanSlotId}`), initialRecord);

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

  const newHospObj: Hospital = {
    id: generatedId,
    name: defaultName,
    address: address,
    phone: "+91 20 6645 5100",
    emergencyContact: "+91 20 6645 5999",
    latitude: 18.5204,
    longitude: 73.8567,
    icuTotal: 0,
    icuAvailable: 0,
    icuOccupied: 0,
    ventilatorsTotal: 0,
    ventilatorsAvailable: 0,
    ventilatorsOccupied: 0,
    generalBedsTotal: 0,
    generalBedsAvailable: 0,
    generalBedsOccupied: 0,
    occupancyRate: 0,
    admissionsLast30Min: 0,
    dischargesLast30Min: 0,
    emergencyArrivalsLast30Min: 0,
    predictedIcuAvailable30Min: 0,
    status: 'Operational',
    lastUpdated: 'Just now',
    dateTimeSlot: currentSlotKey
  };

  const currentLocals = getStoredHospitals();
  currentLocals.push(newHospObj);
  saveStoredHospitals(currentLocals);

  return {
    success: true,
    hospitalId: generatedId,
    email,
    hospitalName: defaultName,
    isCloudSynced
  };
}

/**
 * Hospital Login
 */
export async function loginHospital(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; hospitalId: string; email: string; hospitalName: string; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (isFirebaseConfigured && auth && db) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Authenticated with Firebase Auth:", email);

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
 * Fetch nearby hospitals strictly from Firestore database
 */
export async function getNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusKm = CONFIG.SEARCH_RADIUS_KM
): Promise<Hospital[]> {
  const allMap = new Map<string, Hospital>();

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      if (!snap.empty) {
        snap.forEach((d) => {
          const cloudHosp = convertDocToHospital(d.id, d.data());
          allMap.set(cloudHosp.id, cloudHosp);
        });
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY_HOSPITALS);
        }
      }
    } catch (err) {
      console.warn('Firestore getNearbyHospitals notice:', err);
    }
  } else {
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
 * Fetch single hospital resource availability
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
 * Predict resource availability in 30 minutes
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
 * Save Full Hospital Telemetry with 30-Minute Row & Historical Preservation Architecture
 */
export async function saveFullHospitalTelemetry(
  hospitalId: string,
  payload: {
    hospital_name?: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;

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
  }
): Promise<{ success: boolean; hospital: Hospital | null; error?: string }> {
  // Validate input constraints
  const validation = validateTelemetryInputs(payload);
  if (!validation.isValid) {
    return { success: false, hospital: null, error: validation.error };
  }

  const currentSlotKey = get30MinSlotKey();

  // Compute calculated metrics automatically
  const computed = calculateTelemetryMetrics({
    icu_available: payload.icu_available,
    icu_occupied: payload.icu_occupied,
    ventilator_available: payload.ventilator_available,
    ventilator_occupied: payload.ventilator_occupied,
    simple_beds_available: payload.simple_beds_available,
    simple_beds_occupied: payload.simple_beds_occupied,

    admissions_icu_30min: payload.admissions_icu_30min,
    admissions_ventilator_30min: payload.admissions_ventilator_30min,
    admissions_simple_beds_30min: payload.admissions_simple_beds_30min,

    discharges_icu_30min: payload.discharges_icu_30min,
    discharges_ventilator_30min: payload.discharges_ventilator_30min,
    discharges_simple_beds_30min: payload.discharges_simple_beds_30min,

    emergency_arrivals_30min: payload.emergency_arrivals_30min,
  });

  const recordPayload: HospitalTelemetryRecord = {
    hospital_id: hospitalId,
    date_time: currentSlotKey,

    icu_available: payload.icu_available,
    icu_occupied: payload.icu_occupied,
    ventilator_available: payload.ventilator_available,
    ventilator_occupied: payload.ventilator_occupied,
    simple_beds_available: payload.simple_beds_available,
    simple_beds_occupied: payload.simple_beds_occupied,

    admissions_icu_30min: payload.admissions_icu_30min,
    admissions_ventilator_30min: payload.admissions_ventilator_30min,
    admissions_simple_beds_30min: payload.admissions_simple_beds_30min,

    discharges_icu_30min: payload.discharges_icu_30min,
    discharges_ventilator_30min: payload.discharges_ventilator_30min,
    discharges_simple_beds_30min: payload.discharges_simple_beds_30min,

    emergency_arrivals_30min: payload.emergency_arrivals_30min,

    icu_total: computed.icu_total,
    ventilator_total: computed.ventilator_total,
    simple_beds_total: computed.simple_beds_total,

    icu_occupancy_rate: computed.icu_occupancy_rate,
    ventilator_occupancy_rate: computed.ventilator_occupancy_rate,
    simple_beds_occupancy_rate: computed.simple_beds_occupancy_rate,

    icu_available_after_30min: computed.icu_available_after_30min,
    ventilator_available_after_30min: computed.ventilator_available_after_30min,
    simple_beds_available_after_30min: computed.simple_beds_available_after_30min,
  };

  const name = payload.name || payload.hospital_name || '';
  const address = payload.address || '';
  const lat = payload.latitude ?? 18.5204;
  const lng = payload.longitude ?? 73.8567;

  const firestoreDocData = {
    ...recordPayload,
    hospital_id: hospitalId,
    id: hospitalId,
    hospital_name: name,
    name: name,
    address: address,
    latitude: lat,
    longitude: lng,
    // Alias fields for backwards compatibility with legacy UI components
    icu_total: computed.icu_total,
    icuTotal: computed.icu_total,
    icu_available: payload.icu_available,
    icuAvailable: payload.icu_available,
    icu_occupied: payload.icu_occupied,
    icuOccupied: payload.icu_occupied,

    ventilator_total: computed.ventilator_total,
    ventilatorsTotal: computed.ventilator_total,
    ventilators_available: payload.ventilator_available,
    ventilatorsAvailable: payload.ventilator_available,
    ventilatorsOccupied: payload.ventilator_occupied,

    general_beds_total: computed.simple_beds_total,
    generalBedsTotal: computed.simple_beds_total,
    general_beds_available: payload.simple_beds_available,
    generalBedsAvailable: payload.simple_beds_available,
    generalBedsOccupied: payload.simple_beds_occupied,

    occupancy_rate: computed.icu_occupancy_rate,
    occupancyRate: computed.icu_occupancy_rate,

    admission_last_30min: payload.admissions_icu_30min,
    admissionsLast30Min: payload.admissions_icu_30min,
    discharge_last_30min: payload.discharges_icu_30min,
    dischargesLast30Min: payload.discharges_icu_30min,
    emergency_arrival_last_30min: payload.emergency_arrivals_30min,
    emergencyArrivalsLast30Min: payload.emergency_arrivals_30min,

    icu_available_30min_later: computed.icu_available_after_30min,
    predictedIcuAvailable30Min: computed.icu_available_after_30min,
    predictedVentilatorsAvailable30Min: computed.ventilator_available_after_30min,
    predictedGeneralBedsAvailable30Min: computed.simple_beds_available_after_30min,
    lastUpdated: 'Just now'
  };

  if (isFirebaseConfigured && db) {
    try {
      // 1. Save active current telemetry document
      await setDoc(doc(db, FIRESTORE_COLLECTION, hospitalId), firestoreDocData, { merge: true });

      // 2. Save historical 30-min slot record (Preserving immutable history for future ML)
      const cleanSlotId = currentSlotKey.replace(/[: ]/g, '_');
      await setDoc(doc(db, FIRESTORE_COLLECTION, hospitalId, 'history', cleanSlotId), recordPayload);
      await setDoc(doc(db, FIRESTORE_HISTORY_COLLECTION, `${hospitalId}_${cleanSlotId}`), recordPayload);

      console.log(`✅ Saved 30-min telemetry row [${currentSlotKey}] for ${hospitalId}`);
    } catch (err: any) {
      console.warn('Firestore save notice (saved locally):', err.message);
    }
  }

  // Update local storage state cache
  const locals = getStoredHospitals();
  const idx = locals.findIndex((h) => h.id === hospitalId);
  const updatedHospitalObj = convertDocToHospital(hospitalId, firestoreDocData);

  if (idx !== -1) {
    locals[idx] = updatedHospitalObj;
  } else {
    locals.push(updatedHospitalObj);
  }
  saveStoredHospitals(locals);

  // Add audit log entry
  const now = new Date();
  addStoredActivityLog({
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    resourceType: 'ICU',
    action: '30-Min Telemetry Saved',
    details: `Slot: ${currentSlotKey} | ICU (${payload.icu_available}/${computed.icu_total}, ${computed.icu_occupancy_rate}%), Vent (${payload.ventilator_available}/${computed.ventilator_total}, ${computed.ventilator_occupancy_rate}%), Bed (${payload.simple_beds_available}/${computed.simple_beds_total}, ${computed.simple_beds_occupancy_rate}%)`,
    updatedBy: 'Hospital Operations'
  });

  return { success: true, hospital: updatedHospitalObj };
}

/**
 * Auto-deduct resource availability and update admissions / occupied counts when accepting an ambulance booking
 */
export async function acceptBookingResourceDeduction(
  hospitalId: string,
  resourceType: ResourceType,
  quantity: number = 1
): Promise<boolean> {
  const current = await getHospitalAvailability(hospitalId);
  if (!current) return false;

  let icuAvail = current.icuAvailable ?? 0;
  let icuOcc = current.icuOccupied ?? 0;
  let icuAdm = current.admissionsIcu30min ?? current.admissionsLast30Min ?? 0;

  let ventAvail = current.ventilatorsAvailable ?? 0;
  let ventOcc = current.ventilatorsOccupied ?? 0;
  let ventAdm = current.admissionsVentilator30min ?? 0;

  let bedAvail = current.generalBedsAvailable ?? 0;
  let bedOcc = current.generalBedsOccupied ?? 0;
  let bedAdm = current.admissionsSimpleBeds30min ?? 0;

  let emArrivals = (current.emergencyArrivals30min ?? current.emergencyArrivalsLast30Min ?? 0) + 1;

  if (resourceType === 'ICU') {
    icuAvail = Math.max(0, icuAvail - quantity);
    icuOcc += quantity;
    icuAdm += quantity;
  } else if (resourceType === 'Ventilator') {
    ventAvail = Math.max(0, ventAvail - quantity);
    ventOcc += quantity;
    ventAdm += quantity;
  } else if (resourceType === 'General Bed') {
    bedAvail = Math.max(0, bedAvail - quantity);
    bedOcc += quantity;
    bedAdm += quantity;
  }

  const payload = {
    hospital_id: current.id,
    date_time: get30MinSlotKey(),
    name: current.name,
    hospital_name: current.name,
    address: current.address,
    latitude: current.latitude,
    longitude: current.longitude,

    icu_available: icuAvail,
    icu_occupied: icuOcc,
    ventilator_available: ventAvail,
    ventilator_occupied: ventOcc,
    simple_beds_available: bedAvail,
    simple_beds_occupied: bedOcc,

    admissions_icu_30min: icuAdm,
    admissions_ventilator_30min: ventAdm,
    admissions_simple_beds_30min: bedAdm,

    discharges_icu_30min: current.dischargesIcu30min ?? current.dischargesLast30Min ?? 0,
    discharges_ventilator_30min: current.dischargesVentilator30min ?? 0,
    discharges_simple_beds_30min: current.dischargesSimpleBeds30min ?? 0,

    emergency_arrivals_30min: emArrivals,
  };

  const res = await saveFullHospitalTelemetry(current.id, payload);
  return res.success;
}

/**
 * Match and find suitable hospitals based on live Firestore data
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
 * Update single hospital resource category
 */
export async function updateHospitalResources(
  hospitalId: string,
  payload: ResourceUpdatePayload
): Promise<{ success: boolean; hospital: Hospital | null; error?: string }> {
  const currentHospital = await getHospitalAvailability(hospitalId);
  if (!currentHospital) {
    return { success: false, hospital: null, error: 'Hospital not found' };
  }

  const icuAvail = payload.resourceType === 'ICU' ? Math.max(0, payload.availableCount) : currentHospital.icuAvailable;
  const icuOcc = payload.resourceType === 'ICU' && payload.occupiedCount !== undefined ? Math.max(0, payload.occupiedCount) : (currentHospital.icuOccupied ?? 0);

  const ventAvail = payload.resourceType === 'Ventilator' ? Math.max(0, payload.availableCount) : currentHospital.ventilatorsAvailable;
  const ventOcc = payload.resourceType === 'Ventilator' && payload.occupiedCount !== undefined ? Math.max(0, payload.occupiedCount) : (currentHospital.ventilatorsOccupied ?? 0);

  const bedAvail = payload.resourceType === 'General Bed' ? Math.max(0, payload.availableCount) : currentHospital.generalBedsAvailable;
  const bedOcc = payload.resourceType === 'General Bed' && payload.occupiedCount !== undefined ? Math.max(0, payload.occupiedCount) : (currentHospital.generalBedsOccupied ?? 0);

  return saveFullHospitalTelemetry(hospitalId, {
    name: currentHospital.name,
    address: currentHospital.address,
    latitude: currentHospital.latitude,
    longitude: currentHospital.longitude,

    icu_available: icuAvail,
    icu_occupied: icuOcc,

    ventilator_available: ventAvail,
    ventilator_occupied: ventOcc,

    simple_beds_available: bedAvail,
    simple_beds_occupied: bedOcc,

    admissions_icu_30min: currentHospital.admissionsIcu30min ?? currentHospital.admissionsLast30Min ?? 0,
    admissions_ventilator_30min: currentHospital.admissionsVentilator30min ?? 0,
    admissions_simple_beds_30min: currentHospital.admissionsSimpleBeds30min ?? 0,

    discharges_icu_30min: currentHospital.dischargesIcu30min ?? currentHospital.dischargesLast30Min ?? 0,
    discharges_ventilator_30min: currentHospital.dischargesVentilator30min ?? 0,
    discharges_simple_beds_30min: currentHospital.dischargesSimpleBeds30min ?? 0,

    emergency_arrivals_30min: currentHospital.emergencyArrivals30min ?? currentHospital.emergencyArrivalsLast30Min ?? 0
  });
}
