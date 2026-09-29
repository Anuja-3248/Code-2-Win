import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { EmergencyBooking, CreateBookingInput, AcceptBookingPayload, BookingStatus } from '../types/booking';
import { getStoredAmbulanceProfile } from './ambulanceService';
import { acceptBookingResourceDeduction } from './hospitalService';

const STORAGE_BOOKINGS_KEY = 'resqlink_all_bookings';
const STORAGE_ACTIVE_BOOKING_ID = 'resqlink_active_booking_id';

// Generate a readable booking reference (e.g. BK-4092)
export function generateBookingId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BK-${num}`;
}

// 1. Create a new Hospital Booking Request from Ambulance/Patient
export async function createHospitalBooking(input: CreateBookingInput): Promise<EmergencyBooking> {
  const ambulance = getStoredAmbulanceProfile() || {
    ambulanceId: 'AMB-108',
    vehicleNumber: 'MH12 AB 1080',
    driverName: 'Suresh More',
    driverPhone: '+91 98220 12345',
    ambulanceType: 'ALS',
    email: 'amb108@pune-ems.gov.in',
    registeredAt: new Date().toISOString(),
  };

  const bookingId = generateBookingId();
  const newBooking: EmergencyBooking = {
    id: bookingId,
    ambulanceId: ambulance.ambulanceId,
    vehicleNumber: ambulance.vehicleNumber,
    driverName: ambulance.driverName,
    driverPhone: ambulance.driverPhone,
    ambulanceType: ambulance.ambulanceType,
    
    targetHospitalId: input.targetHospitalId,
    targetHospitalName: input.targetHospitalName,
    targetHospitalAddress: input.targetHospitalAddress,
    targetHospitalPhone: input.targetHospitalPhone,
    
    patientName: input.patientName?.trim() || 'Emergency Patient',
    patientAge: input.patientAge || '45',
    patientGender: input.patientGender || 'Male',
    patientCondition: input.patientCondition?.trim() || 'Acute Emergency Trauma',
    urgencyLevel: input.urgencyLevel || 'Critical',
    
    requiredResource: input.requiredResource || 'ICU',
    quantity: input.quantity || 1,
    
    etaMinutes: input.etaMinutes || 10,
    distanceKm: input.distanceKm || 3.2,
    originLocationName: input.originLocationName || 'Pune EMS Transit',
    
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  // 1. Save to Firebase Firestore if online
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'hospitalBookings', bookingId), newBooking);
      console.log('✅ Booking synced to Firebase Cloud:', bookingId);
    } catch (err) {
      console.warn('Firebase booking sync notice:', err);
    }
  }

  // 2. Save locally for instant real-time sync across tabs
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    const list: EmergencyBooking[] = raw ? JSON.parse(raw) : [];
    list.unshift(newBooking);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(list.slice(0, 100)));
    localStorage.setItem(STORAGE_ACTIVE_BOOKING_ID, bookingId);

    // Also notify hospital pre-alert system
    window.dispatchEvent(new CustomEvent('resqlink_new_booking', { detail: newBooking }));
    window.dispatchEvent(new CustomEvent('resqlink_booking_updated', { detail: newBooking }));
  } catch (err) {
    console.error('Failed to store booking locally:', err);
  }

  return newBooking;
}

// 2. Accept Booking by Hospital
export async function acceptHospitalBooking(
  bookingId: string,
  payload: AcceptBookingPayload = {}
): Promise<EmergencyBooking | null> {
  const updatedData: Partial<EmergencyBooking> = {
    status: 'ACCEPTED',
    allocatedBay: payload.allocatedBay?.trim() || 'Emergency Bay 01 (Trauma Wing)',
    attendingDoctor: payload.attendingDoctor?.trim() || 'Dr. Arvind Sharma (Chief of Trauma)',
    hospitalNotes: payload.hospitalNotes?.trim() || 'Critical Care team assembled. Direct ambulance to ER Gate 2.',
    acceptedAt: new Date().toISOString(),
  };

  // Update in Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'hospitalBookings', bookingId), updatedData);
    } catch (err) {
      console.warn('Firebase booking acceptance update notice:', err);
    }
  }

  // Update locally & adjust hospital resource count
  let targetBooking: EmergencyBooking | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (raw) {
      const list: EmergencyBooking[] = JSON.parse(raw);
      const updatedList = list.map((b) => {
        if (b.id === bookingId) {
          targetBooking = { ...b, ...updatedData };
          return targetBooking;
        }
        return b;
      });
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('resqlink_booking_updated', { detail: targetBooking }));
    }
  } catch (err) {
    console.error('Failed to update booking locally:', err);
  }

  // Auto-deduct resource availability and update telemetry counts for accepted booking
  if (targetBooking) {
    const booking = targetBooking as EmergencyBooking;
    try {
      await acceptBookingResourceDeduction(booking.targetHospitalId, booking.requiredResource as any, booking.quantity || 1);
    } catch (e) {
      console.warn('Auto capacity decrement note:', e);
    }
  }

  return targetBooking;
}

// 3. Decline / Divert Booking by Hospital
export async function declineHospitalBooking(
  bookingId: string,
  declineReason = 'Emergency department temporarily at critical capacity. Diverting to nearby tertiary node.'
): Promise<EmergencyBooking | null> {
  const updatedData: Partial<EmergencyBooking> = {
    status: 'DECLINED',
    declineReason,
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'hospitalBookings', bookingId), updatedData);
    } catch (err) {
      console.warn('Firebase booking decline update notice:', err);
    }
  }

  let targetBooking: EmergencyBooking | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (raw) {
      const list: EmergencyBooking[] = JSON.parse(raw);
      const updatedList = list.map((b) => {
        if (b.id === bookingId) {
          targetBooking = { ...b, ...updatedData };
          return targetBooking;
        }
        return b;
      });
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('resqlink_booking_updated', { detail: targetBooking }));
    }
  } catch (err) {
    console.error('Failed to update booking locally:', err);
  }

  return targetBooking;
}

// 4. Mark Patient Admitted / Arrived
export async function markPatientAdmitted(bookingId: string): Promise<EmergencyBooking | null> {
  const updatedData: Partial<EmergencyBooking> = {
    status: 'ADMITTED',
    admittedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'hospitalBookings', bookingId), updatedData);
    } catch (err) {
      console.warn('Firebase booking admit update notice:', err);
    }
  }

  let targetBooking: EmergencyBooking | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (raw) {
      const list: EmergencyBooking[] = JSON.parse(raw);
      const updatedList = list.map((b) => {
        if (b.id === bookingId) {
          targetBooking = { ...b, ...updatedData };
          return targetBooking;
        }
        return b;
      });
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('resqlink_booking_updated', { detail: targetBooking }));
    }
  } catch (err) {
    console.error('Failed to update booking locally:', err);
  }

  return targetBooking;
}

// 5. Get Stored Active Booking for Current Ambulance Session
export function getActiveAmbulanceBooking(): EmergencyBooking | null {
  try {
    const activeId = localStorage.getItem(STORAGE_ACTIVE_BOOKING_ID);
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (!raw) return null;
    const list: EmergencyBooking[] = JSON.parse(raw);
    if (activeId) {
      const match = list.find((b) => b.id === activeId);
      if (match && match.status !== 'CANCELLED') return match;
    }
    // Return latest pending or accepted booking
    const active = list.find((b) => b.status === 'PENDING' || b.status === 'ACCEPTED');
    return active || null;
  } catch {
    return null;
  }
}

// 6. Clear / Cancel Active Booking
export function cancelActiveBooking(bookingId?: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (raw) {
      const list: EmergencyBooking[] = JSON.parse(raw);
      const targetId = bookingId || localStorage.getItem(STORAGE_ACTIVE_BOOKING_ID);
      const updated = list.map((b) => (b.id === targetId ? { ...b, status: 'CANCELLED' as BookingStatus } : b));
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    }
    localStorage.removeItem(STORAGE_ACTIVE_BOOKING_ID);
    window.dispatchEvent(new CustomEvent('resqlink_booking_updated', { detail: null }));
  } catch (err) {
    console.error('Failed to clear active booking:', err);
  }
}

// 7. Subscribe to Hospital Inbound Bookings (Real-time listener for Hospital Dashboard)
export function subscribeHospitalBookings(
  hospitalId: string,
  onUpdate: (bookings: EmergencyBooking[]) => void
): () => void {
  const loadLocal = () => {
    try {
      const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
      if (!raw) {
        onUpdate([]);
        return;
      }
      const list: EmergencyBooking[] = JSON.parse(raw);
      const filtered = list.filter((b) => b.targetHospitalId === hospitalId && b.status !== 'CANCELLED');
      onUpdate(filtered);
    } catch {
      onUpdate([]);
    }
  };

  loadLocal();

  const handleUpdate = () => loadLocal();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_BOOKINGS_KEY) loadLocal();
  };

  window.addEventListener('resqlink_new_booking', handleUpdate);
  window.addEventListener('resqlink_booking_updated', handleUpdate);
  window.addEventListener('storage', handleStorage);

  let unsubFirestore: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'hospitalBookings'), where('targetHospitalId', '==', hospitalId));
      unsubFirestore = onSnapshot(q, (snapshot) => {
        const cloudBookings: EmergencyBooking[] = [];
        snapshot.forEach((d) => {
          cloudBookings.push(d.data() as EmergencyBooking);
        });
        cloudBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(cloudBookings);
      });
    } catch (err) {
      console.warn('Firestore bookings subscription error:', err);
    }
  }

  return () => {
    window.removeEventListener('resqlink_new_booking', handleUpdate);
    window.removeEventListener('resqlink_booking_updated', handleUpdate);
    window.removeEventListener('storage', handleStorage);
    if (unsubFirestore) unsubFirestore();
  };
}

// 8. Subscribe to Ambulance Active Booking Updates (Real-time listener for Ambulance UI)
export function subscribeAmbulanceBooking(
  onUpdate: (booking: EmergencyBooking | null) => void
): () => void {
  const checkActive = () => {
    const active = getActiveAmbulanceBooking();
    onUpdate(active);
  };

  checkActive();

  const handleUpdate = () => checkActive();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_BOOKINGS_KEY || e.key === STORAGE_ACTIVE_BOOKING_ID) checkActive();
  };

  window.addEventListener('resqlink_new_booking', handleUpdate);
  window.addEventListener('resqlink_booking_updated', handleUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('resqlink_new_booking', handleUpdate);
    window.removeEventListener('resqlink_booking_updated', handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}
