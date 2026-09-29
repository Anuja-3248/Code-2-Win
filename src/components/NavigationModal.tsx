import React, { useState } from 'react';
import { X, Navigation, Phone, CheckCircle, ExternalLink, Compass, Radio } from 'lucide-react';
import type { Hospital } from '../types/hospital';
import type { EmergencyRequest } from '../types/emergency';
import { getStoredAmbulanceProfile, sendPreAlert } from '../services/ambulanceService';
import type { PreAlertPayload } from '../types/ambulance';

interface NavigationModalProps {
  hospital: Hospital | null;
  onClose: () => void;
  request?: EmergencyRequest | null;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({ hospital, onClose, request }) => {
  const [dispatchedAlert, setDispatchedAlert] = useState<PreAlertPayload | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!hospital) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${hospital.name}, ${hospital.address}`
  )}`;

  // Load active request from prop or session
  const activeReq: EmergencyRequest = request || (() => {
    try {
      const raw = sessionStorage.getItem('resqlink_active_request');
      return raw ? JSON.parse(raw) : { resource: 'ICU', quantity: 1, latitude: 18.5204, longitude: 73.8567 };
    } catch {
      return { resource: 'ICU', quantity: 1, latitude: 18.5204, longitude: 73.8567 };
    }
  })();

  const ambulanceProfile = getStoredAmbulanceProfile() || {
    ambulanceId: 'AMB-108',
    vehicleNumber: 'MH12 AB 1080',
    driverName: 'Suresh More',
    driverPhone: '+91 98220 12345',
    ambulanceType: 'ALS' as const,
    email: 'amb108@pune-ems.gov.in',
    registeredAt: new Date().toISOString(),
  };

  const handlePreAlertHospital = async () => {
    setIsSending(true);
    try {
      const alert = await sendPreAlert({
        ambulanceId: ambulanceProfile.ambulanceId,
        vehicleNumber: ambulanceProfile.vehicleNumber,
        driverName: ambulanceProfile.driverName,
        driverPhone: ambulanceProfile.driverPhone,
        ambulanceType: ambulanceProfile.ambulanceType,
        targetHospitalId: hospital.id,
        targetHospitalName: hospital.name,
        requiredResource: activeReq.resource || 'ICU',
        quantity: activeReq.quantity || 1,
        patientCondition: 'Emergency Trauma / Acute Triage Required',
        urgencyLevel: activeReq.urgencyLevel || 'Critical',
        latitude: activeReq.latitude || hospital.latitude,
        longitude: activeReq.longitude || hospital.longitude,
        originLocationName: activeReq.locationName || 'Ambulance En Route',
        etaMinutes: hospital.etaMinutes || 12,
        distanceKm: hospital.distanceKm || 3.5,
      });
      setDispatchedAlert(alert);
    } catch (err) {
      console.error('Failed to send pre-alert:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        className="resq-card"
        style={{
          width: '100%',
          maxWidth: 580,
          padding: '2.25rem 2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 25px 60px -10px rgba(5, 14, 29, 0.4), inset 0 1.5px 1px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'var(--royal-gradient-3d)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              }}
            >
              <Navigation size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-navy)' }}>En Route Dispatch</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Target Destination & Emergency Pre-Alert
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(240, 249, 255, 0.8)',
              border: '1px solid rgba(186, 230, 253, 0.8)',
              color: 'var(--text-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Destination Hospital Summary */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {hospital.name}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            {hospital.address}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '0.55rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {hospital.distanceKm !== undefined ? `${hospital.distanceKm.toFixed(1)} km` : '4.2 km'}
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.55rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Transit Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {hospital.etaMinutes !== undefined ? `~${Math.round(hospital.etaMinutes)} mins` : '~12 mins'}
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.55rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ICU Beds</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>
                {hospital.icuAvailable} Free
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ER Emergency Hotline:</span>
            <a href={`tel:${hospital.emergencyContact}`} style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              <Phone size={14} />
              {hospital.emergencyContact}
            </a>
          </div>
        </div>

        {/* Live Pre-Alert Card */}
        <div
          style={{
            backgroundColor: dispatchedAlert ? '#f0fdf4' : '#f8fafc',
            border: `1.5px solid ${dispatchedAlert ? '#86efac' : '#cbd5e1'}`,
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {dispatchedAlert ? (
                <CheckCircle size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
              ) : (
                <Radio size={22} style={{ color: '#2563eb', flexShrink: 0 }} />
              )}
              <div>
                <strong style={{ display: 'block', color: dispatchedAlert ? '#166534' : '#1e293b', fontSize: '0.9rem' }}>
                  {dispatchedAlert ? `Hospital ER Pre-Alert Transmitted (${dispatchedAlert.id})` : 'Send Pre-Alert to Hospital ER'}
                </strong>
                <span style={{ color: dispatchedAlert ? '#15803d' : '#64748b', fontSize: '0.8rem' }}>
                  {dispatchedAlert
                    ? `Unit ${dispatchedAlert.ambulanceId} (${dispatchedAlert.vehicleNumber}) telemetry delivered. ER staff preparing triage bay.`
                    : `Broadcasting as Unit ${ambulanceProfile.ambulanceId} (${ambulanceProfile.vehicleNumber}) with required ${activeReq.resource} capacity.`}
                </span>
              </div>
            </div>

            {!dispatchedAlert && (
              <button
                type="button"
                onClick={handlePreAlertHospital}
                disabled={isSending}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                }}
              >
                {isSending ? 'Sending...' : '⚡ Send Pre-Alert'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Close
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Compass size={16} />
            Open in Google Maps Navigation
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
