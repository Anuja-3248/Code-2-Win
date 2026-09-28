import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { AmbulanceProfile, PreAlertPayload, PreAlertStatus } from '../types/ambulance';

const STORAGE_AMBULANCE_KEY = 'resqlink_ambulance_session';
const STORAGE_PREALERTS_KEY = 'resqlink_all_prealerts';
const STORAGE_AMBULANCE_ACCOUNTS = 'resqlink_ambulance_accounts';

// Generate a memorable 3-digit Ambulance ID (e.g. AMB-108)
export function generateAmbulanceId(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `AMB-${num}`;
}

// 1. Get stored permanent ambulance session
export function getStoredAmbulanceProfile(): AmbulanceProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_AMBULANCE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AmbulanceProfile;
  } catch {
    return null;
  }
}

// Helper to save ambulance session permanently
export function persistAmbulanceSession(profile: AmbulanceProfile): void {
  localStorage.setItem(STORAGE_AMBULANCE_KEY, JSON.stringify(profile));
  // Broadcast login event
  window.dispatchEvent(new CustomEvent('resqlink_ambulance_updated', { detail: profile }));
}

// Helper to get local accounts
function getLocalAmbulanceAccounts(): Array<{ email: string; password?: string; profile: AmbulanceProfile }> {
  try {
    const raw = localStorage.getItem(STORAGE_AMBULANCE_ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 2. Register Ambulance (Permanent session created)
export interface RegisterAmbulanceInput {
  email: string;
  password?: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  ambulanceType?: 'ALS' | 'BLS' | 'Patient Transport' | 'Neonatal';
  baseStation?: string;
}

export async function registerAmbulance(input: RegisterAmbulanceInput): Promise<AmbulanceProfile> {
  const ambulanceId = generateAmbulanceId();
  const profile: AmbulanceProfile = {
    ambulanceId,
    email: input.email.trim().toLowerCase(),
    vehicleNumber: input.vehicleNumber.trim().toUpperCase(),
    driverName: input.driverName.trim(),
    driverPhone: input.driverPhone.trim(),
    ambulanceType: input.ambulanceType || 'ALS',
    baseStation: input.baseStation?.trim() || 'Pune Central Depot',
    registeredAt: new Date().toISOString(),
  };

  // Try Firebase Auth and Firestore if configured
  if (isFirebaseConfigured && auth && db && input.password) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCred = await createUserWithEmailAndPassword(auth, profile.email, input.password);
      await setDoc(doc(db, 'ambulances', userCred.user.uid), {
        ...profile,
        uid: userCred.user.uid,
      });
      console.log('✅ Ambulance registered in Firebase Firestore:', profile.ambulanceId);
    } catch (err: any) {
      console.warn('Firebase register notice (saving locally):', err.message);
    }
  }

  // Always save locally so ambulance stays logged in forever
  const accounts = getLocalAmbulanceAccounts();
  accounts.push({ email: profile.email, password: input.password, profile });
  localStorage.setItem(STORAGE_AMBULANCE_ACCOUNTS, JSON.stringify(accounts));
  persistAmbulanceSession(profile);

  return profile;
}

// 3. Login Ambulance (e.g. on new device)
export async function loginAmbulance(email: string, password?: string): Promise<AmbulanceProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // Try Firebase Auth if configured
  if (isFirebaseConfigured && auth && db && password) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const snap = await getDoc(doc(db, 'ambulances', userCred.user.uid));
      if (snap.exists()) {
        const profile = snap.data() as AmbulanceProfile;
        persistAmbulanceSession(profile);
        return profile;
      }
    } catch (err: any) {
      console.warn('Firebase login attempt failed, checking local accounts:', err.message);
    }
  }

  // Check local accounts
  const accounts = getLocalAmbulanceAccounts();
  const found = accounts.find((a) => a.email === cleanEmail);
  if (found) {
    persistAmbulanceSession(found.profile);
    return found.profile;
  }

  // If new, create quick profile
  const newProfile: AmbulanceProfile = {
    ambulanceId: generateAmbulanceId(),
    email: cleanEmail,
    vehicleNumber: 'MH12 EM 9999',
    driverName: cleanEmail.split('@')[0],
    driverPhone: '+91 9876543210',
    ambulanceType: 'ALS',
    baseStation: 'Pune EMS Center',
    registeredAt: new Date().toISOString(),
  };
  persistAmbulanceSession(newProfile);
  return newProfile;
}

// 4. Send Pre-Alert to Target Hospital
export async function sendPreAlert(
  payload: Omit<PreAlertPayload, 'id' | 'status' | 'timestamp'>
): Promise<PreAlertPayload> {
  const alertId = `ALERT-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullAlert: PreAlertPayload = {
    ...payload,
    id: alertId,
    status: 'EN_ROUTE',
    timestamp: new Date().toISOString(),
  };

  // 1. Try Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'preAlerts', alertId), fullAlert);
      console.log('✅ Pre-Alert synced to Firebase Cloud:', alertId);
    } catch (err) {
      console.warn('Firebase Pre-Alert sync error:', err);
    }
  }

  // 2. Save locally for instant real-time sync across tabs
  try {
    const existingRaw = localStorage.getItem(STORAGE_PREALERTS_KEY);
    const existingList: PreAlertPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.unshift(fullAlert);
    // Keep last 50 alerts
    localStorage.setItem(STORAGE_PREALERTS_KEY, JSON.stringify(existingList.slice(0, 50)));

    // Dispatch custom browser event
    window.dispatchEvent(new CustomEvent('resqlink_new_prealert', { detail: fullAlert }));
  } catch (err) {
    console.error('Failed to store alert locally:', err);
  }

  return fullAlert;
}

// 5. Subscribe to Hospital Pre-Alerts (Real-time listener for Hospital Dashboard)
export function subscribeHospitalPreAlerts(
  hospitalId: string,
  onUpdate: (alerts: PreAlertPayload[]) => void
): () => void {
  const loadLocalAlerts = () => {
    try {
      const raw = localStorage.getItem(STORAGE_PREALERTS_KEY);
      if (!raw) {
        onUpdate([]);
        return;
      }
      const list: PreAlertPayload[] = JSON.parse(raw);
      const filtered = list.filter((a) => a.targetHospitalId === hospitalId);
      onUpdate(filtered);
    } catch {
      onUpdate([]);
    }
  };

  // Initial load
  loadLocalAlerts();

  // Listen to local tab changes
  const handleLocalEvent = () => loadLocalAlerts();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_PREALERTS_KEY) {
      loadLocalAlerts();
    }
  };

  window.addEventListener('resqlink_new_prealert', handleLocalEvent);
  window.addEventListener('resqlink_prealert_status_changed', handleLocalEvent);
  window.addEventListener('storage', handleStorageEvent);

  // If Firebase Firestore is configured, listen to Firestore onSnapshot
  let unsubFirestore: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'preAlerts'), where('targetHospitalId', '==', hospitalId));
      unsubFirestore = onSnapshot(q, (snapshot) => {
        const cloudAlerts: PreAlertPayload[] = [];
        snapshot.forEach((doc) => {
          cloudAlerts.push(doc.data() as PreAlertPayload);
        });
        cloudAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(cloudAlerts);
      });
    } catch (err) {
      console.warn('Firestore subscription error:', err);
    }
  }

  return () => {
    window.removeEventListener('resqlink_new_prealert', handleLocalEvent);
    window.removeEventListener('resqlink_prealert_status_changed', handleLocalEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (unsubFirestore) unsubFirestore();
  };
}

// 6. Acknowledge / Update Pre-Alert Status by Hospital
export async function updatePreAlertStatus(
  alertId: string, 
  newStatus: PreAlertStatus
): Promise<void> {
  // Update Firestore if online
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'preAlerts', alertId), {
        status: newStatus,
        acknowledgedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore update alert status notice:', err);
    }
  }

  // Update local storage
  try {
    const raw = localStorage.getItem(STORAGE_PREALERTS_KEY);
    if (raw) {
      const list: PreAlertPayload[] = JSON.parse(raw);
      const updated = list.map((a) => 
        a.id === alertId ? { ...a, status: newStatus, acknowledgedAt: new Date().toISOString() } : a
      );
      localStorage.setItem(STORAGE_PREALERTS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('resqlink_prealert_status_changed', { detail: { alertId, newStatus } }));
    }
  } catch (err) {
    console.error('Failed to update pre-alert locally:', err);
  }
}
