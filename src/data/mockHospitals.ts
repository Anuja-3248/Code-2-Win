import type { Hospital, HospitalActivityLog } from '../types/hospital';

/**
 * All hospital data is stored and fetched directly from the live Firebase Firestore database.
 * No static mock hospitals are used.
 */
export const INITIAL_MOCK_HOSPITALS: Hospital[] = [];

export const INITIAL_ACTIVITY_LOGS: HospitalActivityLog[] = [];
