import React, { useState } from 'react';
import {
  X,
  Hospital as HospitalIcon,
  Activity,
  Send,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import type { Hospital, ResourceType } from '../types/hospital';
import type { EmergencyRequest } from '../types/emergency';
import type { UrgencyLevel, EmergencyBooking } from '../types/booking';
import { createHospitalBooking } from '../services/bookingService';
import { getStoredAmbulanceProfile } from '../services/ambulanceService';

interface BookingModalProps {
  hospital: Hospital | null;
  request?: EmergencyRequest | null;
  onClose: () => void;
  onBookingSuccess: (booking: EmergencyBooking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  hospital,
  request,
  onClose,
  onBookingSuccess,
}) => {
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('Critical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<EmergencyBooking | null>(null);

  if (!hospital) return null;

  const requiredResource = (request?.resource as ResourceType) || 'ICU';
  const quantity = request?.quantity || 1;

  const ambulanceProfile = getStoredAmbulanceProfile() || {
    ambulanceId: 'AMB-108',
    vehicleNumber: 'MH12 AB 1080',
    driverName: 'Suresh More',
    driverPhone: '+91 98220 12345',
    ambulanceType: 'ALS',
    email: 'amb108@pune-ems.gov.in',
    registeredAt: new Date().toISOString(),
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const booking = await createHospitalBooking({
        targetHospitalId: hospital.id,
        targetHospitalName: hospital.name,
        targetHospitalAddress: hospital.address,
        targetHospitalPhone: hospital.emergencyContact,
        requiredResource,
        quantity,
        patientName: 'Emergency Trauma Patient',
        patientCondition: `${urgencyLevel} Emergency Triage Protocol`,
        urgencyLevel,
        etaMinutes: hospital.etaMinutes || 10,
        distanceKm: hospital.distanceKm || 3.2,
        originLocationName: request?.locationName || 'Pune EMS Sector',
      });

      setCreatedBooking(booking);
      setTimeout(() => {
        onBookingSuccess(booking);
      }, 750);
    } catch (err) {
      console.error('Failed to create emergency booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        className="resq-card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '2rem 2.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 25px 60px -10px rgba(5, 14, 29, 0.45), inset 0 1.5px 1px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-emergency" style={{ fontSize: '0.78rem', gap: '5px' }}>
                <Activity size={13} className="status-dot-pulse" />
                Rapid ER Booking Request
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
              Confirm Hospital Booking
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reserves capacity instantly at <strong>{hospital.name}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'rgba(240, 249, 255, 0.8)',
              border: '1px solid rgba(186, 230, 253, 0.8)',
              color: 'var(--text-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Hospital & Resource Highlight Capsule */}
        <div
          style={{
            backgroundColor: 'rgba(240, 249, 255, 0.8)',
            border: '1.5px solid rgba(186, 230, 253, 0.9)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.15rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'var(--royal-gradient-3d)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HospitalIcon size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                {hospital.name}
              </h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ETA: <strong style={{ color: 'var(--royal-700)' }}>~{hospital.etaMinutes || 10} min</strong> ({hospital.distanceKm || 3.2} km)
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #10B981',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700 }}>Reserving</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#047857' }}>
              {quantity}x {requiredResource} Bed
            </div>
          </div>
        </div>

        {/* Fast Triage Priority Selector Form */}
        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.65rem' }}>
              Select Patient Triage Priority Level:
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(
                [
                  {
                    level: 'Critical' as UrgencyLevel,
                    title: '🔴 Critical Priority',
                    desc: 'Immediate resuscitation / emergency trauma team prep',
                    color: '#DC2626',
                    bg: '#FEF2F2',
                    border: '#EF4444',
                  },
                  {
                    level: 'Urgent' as UrgencyLevel,
                    title: '🟡 Urgent Priority',
                    desc: 'Acute condition requiring bed ready within 15 mins',
                    color: '#B45309',
                    bg: '#FFFBEB',
                    border: '#F59E0B',
                  },
                  {
                    level: 'Standard' as UrgencyLevel,
                    title: '🟢 Standard Emergency',
                    desc: 'Stable patient transfer for standard emergency bed intake',
                    color: '#047857',
                    bg: '#ECFDF5',
                    border: '#10B981',
                  },
                ]
              ).map((item) => {
                const isSelected = urgencyLevel === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setUrgencyLevel(item.level)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2.5px solid ${item.border}` : '1.5px solid rgba(203, 213, 225, 0.8)',
                      backgroundColor: isSelected ? item.bg : 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isSelected ? '0 4px 12px rgba(10, 25, 47, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.color }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.desc}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? `6px solid ${item.border}` : '2px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ambulance Dispatch Identity Bar */}
          <div
            style={{
              backgroundColor: 'rgba(248, 250, 252, 0.9)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.85rem',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Unit: <strong>{ambulanceProfile.ambulanceId} ({ambulanceProfile.vehicleNumber})</strong></span>
            <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> GPS Linked
            </span>
          </div>

          {/* Success Banner if created */}
          {createdBooking && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #10B981',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.15rem',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} />
              <span>✅ Booking Ref #{createdBooking.id} Dispatched to Hospital ER!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                backgroundColor: urgencyLevel === 'Critical' ? '#E11D48' : 'var(--royal-600)',
                backgroundImage:
                  urgencyLevel === 'Critical'
                    ? 'linear-gradient(135deg, #F43F5E 0%, #E11D48 50%, #BE123C 100%)'
                    : 'var(--royal-gradient-3d)',
                boxShadow:
                  urgencyLevel === 'Critical'
                    ? '0 6px 20px -2px rgba(225, 29, 72, 0.5)'
                    : '0 6px 20px -2px rgba(37, 99, 235, 0.45)',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 800,
              }}
            >
              {isSubmitting ? (
                <>Transmitting...</>
              ) : (
                <>
                  <Send size={16} />
                  Send Hospital Booking Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
