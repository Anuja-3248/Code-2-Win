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
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--text-navy)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <MapPin size={18} style={{ color: 'var(--royal-600)' }} />
          Ambulance Location
        </label>

        {/* Use Current Location Action Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.45rem' }}
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

      {/* Location summary container with 3D glass effect */}
      <div
        className="resq-card"
        style={{
          padding: '1.35rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          border: '1.5px solid rgba(186, 230, 253, 0.8)',
          boxShadow: 'var(--shadow-3d)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.95), rgba(186, 230, 253, 0.7))',
                color: 'var(--royal-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(147, 197, 253, 0.8)',
                boxShadow: '0 2px 6px rgba(10, 25, 47, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '1.025rem' }}>
                {location.locationName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Active Emergency GPS Fix
              </div>
            </div>
          </div>

          <span className="badge badge-teal">
            <span className="status-dot status-dot-pulse" style={{ backgroundColor: 'var(--royal-600)' }} />
            GPS Locked & Verified
          </span>
        </div>

        {/* Coordinates grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(186, 230, 253, 0.5)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Latitude
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-navy)', fontFamily: 'monospace' }}>
              {location.latitude.toFixed(4)}° N
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Longitude
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-navy)', fontFamily: 'monospace' }}>
              {location.longitude.toFixed(4)}° E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
