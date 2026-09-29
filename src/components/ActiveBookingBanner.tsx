import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Navigation,
  Phone,
  X,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { EmergencyBooking } from '../types/booking';
import { subscribeAmbulanceBooking, cancelActiveBooking } from '../services/bookingService';

interface ActiveBookingBannerProps {
  onOpenNavigation?: (booking: EmergencyBooking) => void;
}

export const ActiveBookingBanner: React.FC<ActiveBookingBannerProps> = ({ onOpenNavigation }) => {
  const [activeBooking, setActiveBooking] = useState<EmergencyBooking | null>(null);

  useEffect(() => {
    const unsub = subscribeAmbulanceBooking((booking) => {
      setActiveBooking(booking);
    });
    return () => unsub();
  }, []);

  if (!activeBooking || activeBooking.status === 'CANCELLED' || activeBooking.status === 'ADMITTED') {
    return null;
  }

  const isAccepted = activeBooking.status === 'ACCEPTED';
  const isDeclined = activeBooking.status === 'DECLINED';
  const isPending = activeBooking.status === 'PENDING';

  const destQuery = activeBooking.targetHospitalAddress
    ? `${activeBooking.targetHospitalName}, ${activeBooking.targetHospitalAddress}`
    : activeBooking.targetHospitalName;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destQuery)}`;

  return (
    <div
      className="reveal-slide-down"
      style={{
        position: 'sticky',
        top: '74px',
        zIndex: 900,
        marginBottom: '1.5rem',
      }}
    >
      <div
        className="resq-card"
        style={{
          backgroundColor: isAccepted
            ? 'rgba(236, 253, 245, 0.96)'
            : isDeclined
            ? 'rgba(254, 242, 242, 0.96)'
            : 'rgba(255, 251, 235, 0.96)',
          border: isAccepted
            ? '2px solid #10B981'
            : isDeclined
            ? '2px solid #EF4444'
            : '2px solid #F59E0B',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.6rem',
          boxShadow: isAccepted
            ? '0 16px 36px -6px rgba(16, 185, 129, 0.25), inset 0 1px 1px #ffffff'
            : '0 12px 28px -6px rgba(10, 25, 47, 0.15), inset 0 1px 1px #ffffff',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status & Hospital Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: isAccepted ? '#10B981' : isDeclined ? '#EF4444' : '#F59E0B',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(10, 25, 47, 0.15)',
              }}
            >
              {isAccepted ? (
                <CheckCircle2 size={24} />
              ) : isDeclined ? (
                <AlertTriangle size={24} />
              ) : (
                <Activity size={24} className="status-dot-pulse" />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isAccepted ? '#D1FAE5' : isDeclined ? '#FEE2E2' : '#FEF3C7',
                    color: isAccepted ? '#065F46' : isDeclined ? '#991B1B' : '#92400E',
                    border: '1px solid currentColor',
                  }}
                >
                  {isAccepted
                    ? '✅ HOSPITAL BOOKING ACCEPTED & CONFIRMED'
                    : isDeclined
                    ? '❌ HOSPITAL CAPACITY DIVERTED'
                    : '📡 BOOKING TRANSMITTED — AWAITING ER ACCEPTANCE'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  Ref #{activeBooking.id}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-navy)', marginTop: '4px' }}>
                {activeBooking.targetHospitalName}
              </h3>

              {/* Conditional Subtext */}
              {isAccepted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', fontSize: '0.875rem' }}>
                  <div style={{ color: '#065F46', fontWeight: 700 }}>
                    🎯 Assigned Room/Bay: <strong style={{ textDecoration: 'underline' }}>{activeBooking.allocatedBay || 'Trauma Bay 01'}</strong> • Attending: <strong>{activeBooking.attendingDoctor || 'ER Chief'}</strong>
                  </div>
                  {activeBooking.hospitalNotes && (
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      📋 Note: "{activeBooking.hospitalNotes}"
                    </div>
                  )}
                </div>
              )}

              {isPending && (
                <div style={{ fontSize: '0.85rem', color: '#92400E', marginTop: '3px' }}>
                  Approaching ambulance unit <strong>{activeBooking.ambulanceId}</strong> ({activeBooking.driverName}). Requested: <strong>{activeBooking.quantity}x {activeBooking.requiredResource}</strong>. Target hospital ER is reviewing request in real-time.
                </div>
              )}

              {isDeclined && (
                <div style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: '3px' }}>
                  Reason: {activeBooking.declineReason || 'Hospital ED at high capacity surge. Please choose next recommended facility.'}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {onOpenNavigation ? (
              <button
                type="button"
                onClick={() => onOpenNavigation(activeBooking)}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Navigation size={15} />
                Live Navigation
              </button>
            ) : (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Navigation size={15} />
                GPS Navigation
                <ExternalLink size={12} />
              </a>
            )}

            {activeBooking.targetHospitalPhone && (
              <a
                href={`tel:${activeBooking.targetHospitalPhone}`}
                className="btn btn-secondary btn-sm"
                style={{ gap: '5px' }}
              >
                <Phone size={14} />
                Call ER Desk
              </a>
            )}

            <button
              type="button"
              onClick={() => cancelActiveBooking(activeBooking.id)}
              className="btn btn-outline btn-sm"
              title="Dismiss Active Alert"
              style={{ padding: '0.45rem 0.65rem' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
