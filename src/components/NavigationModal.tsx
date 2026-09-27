import React, { useState } from 'react';
import { X, Navigation, Phone, ShieldAlert, CheckCircle, ExternalLink, Compass } from 'lucide-react';
import type { Hospital } from '../types/hospital';

interface NavigationModalProps {
  hospital: Hospital | null;
  onClose: () => void;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({ hospital, onClose }) => {
  const [dispatchedAlert, setDispatchedAlert] = useState(false);

  if (!hospital) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&destination_place_id=${encodeURIComponent(hospital.name)}`;

  const handlePreAlertHospital = () => {
    setDispatchedAlert(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(36, 55, 70, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        className="resq-card"
        style={{
          width: '100%',
          maxWidth: 560,
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--primary-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Navigation size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>En Route Dispatch</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Target: {hospital.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Route Details Box */}
        <div
          style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Distance
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
              {hospital.distanceKm ? `${hospital.distanceKm} km` : '3.2 km'}
            </div>
          </div>

          <div style={{ width: 1, backgroundColor: 'var(--primary-border)' }} />

          <div>
            <div style={{ fontSize: '0.75rem', color: '#1e7e48', fontWeight: 600, textTransform: 'uppercase' }}>
              Estimated Travel Time
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e7e48' }}>
              {hospital.etaMinutes ? `${hospital.etaMinutes} mins` : '9 mins'}
            </div>
          </div>
        </div>

        {/* Hospital Address and ER Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Destination Address:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{hospital.address}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>ER Emergency Hotline:</span>
            <a href={`tel:${hospital.emergencyContact}`} style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={14} />
              {hospital.emergencyContact}
            </a>
          </div>
        </div>

        {/* Pre-Alert / Hospital Notification Simulation */}
        <div
          style={{
            backgroundColor: dispatchedAlert ? 'var(--success-light)' : 'var(--bg-subtle)',
            border: `1px solid ${dispatchedAlert ? 'var(--success-border)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dispatchedAlert ? (
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
            ) : (
              <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
            )}
            <div style={{ fontSize: '0.8125rem' }}>
              <strong style={{ display: 'block', color: 'var(--text-main)' }}>
                {dispatchedAlert ? 'Hospital Triage Pre-Alerted' : 'Pre-Notify Hospital ER'}
              </strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {dispatchedAlert ? 'ER staff alerted to prepare triage bay for arrival.' : 'Send automated inbound telemetry to ER desk'}
              </span>
            </div>
          </div>

          {!dispatchedAlert && (
            <button
              type="button"
              onClick={handlePreAlertHospital}
              className="btn btn-sm btn-secondary"
            >
              Send Pre-Alert
            </button>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Compass size={16} />
            Open in Navigation App
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
