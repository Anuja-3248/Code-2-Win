import React, { useState } from 'react';
import { MapPin, Navigation, Compass, CheckCircle2, Loader2 } from 'lucide-react';
import type { LocationCoordinates } from '../types/emergency';
import { getCurrentLocation } from '../services/locationService';

interface LocationCardProps {
  location: LocationCoordinates;
  onLocationChange: (newLocation: LocationCoordinates) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onLocationChange,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const detected = await getCurrentLocation();
      onLocationChange(detected);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <MapPin size={18} style={{ color: 'var(--primary)' }} />
          Ambulance Location
        </label>

        {/* Use Current Location Action Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          {isLocating ? (
            <>
              <Loader2 size={14} className="status-dot-pulse" />
              Acquiring GPS...
            </>
          ) : justUpdated ? (
            <>
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
              Location Synced
            </>
          ) : (
            <>
              <Navigation size={14} />
              Use Current Location
            </>
          )}
        </button>
      </div>

      {/* Location summary container */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Compass size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                {location.locationName}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Active Ambulance GPS Anchor
              </div>
            </div>
          </div>

          <span className="badge badge-teal">
            <span className="status-dot status-dot-pulse" style={{ backgroundColor: 'var(--primary)' }} />
            GPS Locked
          </span>
        </div>

        {/* Coordinates grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Latitude
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'monospace' }}>
              {location.latitude.toFixed(4)}° N
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Longitude
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'monospace' }}>
              {location.longitude.toFixed(4)}° E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
