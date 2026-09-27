/**
 * ResQLink Global Configuration
 * Set USE_MOCK_DATA to false when connecting to the backend / Firebase / SQL API.
 */
export const CONFIG = {
  USE_MOCK_DATA: true,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.resqlink.local/v1',
  DEFAULT_LOCATION: {
    name: 'Pune, Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
  },
  SEARCH_RADIUS_KM: 25,
  AVERAGE_AMBULANCE_SPEED_KMH: 35, // realistic city traffic with siren clearance
};
