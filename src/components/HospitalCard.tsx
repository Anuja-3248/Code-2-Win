import React from 'react';
import { MapPin, Navigation, Eye, Clock, Sparkles, Send } from 'lucide-react';
import type { Hospital, ResourceType } from '../types/hospital';
import { StatusBadge, type StatusBadgeVariant } from './StatusBadge';
import { LivePredictionIndicator } from './LivePredictionIndicator';

interface HospitalCardProps {
  hospital: Hospital;
  requestedResource: ResourceType;
  requiredQuantity: number;
  statusBadge: StatusBadgeVariant;
  distanceKm: number;
  etaMinutes: number;
  onViewHospital: (hospital: Hospital) => void;
  onNavigate: (hospital: Hospital) => void;
  onBookHospital?: (hospital: Hospital) => void;
  rank?: number;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  requestedResource,
  requiredQuantity,
  statusBadge,
  distanceKm,
  etaMinutes,
  onViewHospital,
  onNavigate,
  onBookHospital,
  rank,
}) => {
  const currentCount =
    requestedResource === 'ICU'
      ? hospital.icuAvailable
      : requestedResource === 'Ventilator'
      ? hospital.ventilatorsAvailable
      : hospital.generalBedsAvailable;

  const predictedCount =
    requestedResource === 'ICU'
      ? hospital.predictedIcuAvailable30Min
      : requestedResource === 'Ventilator'
      ? hospital.predictedVentilatorsAvailable30Min || Math.max(0, currentCount - 1)
      : hospital.predictedGeneralBedsAvailable30Min || Math.max(0, currentCount - 2);

  const staggerClass = rank ? `stagger-${Math.min(rank, 6)}` : 'reveal-slide-up';

  return (
    <div
      className={`resq-card resq-card-interactive reveal-slide-up ${staggerClass}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        border: rank === 1 ? '2.5px solid var(--royal-600)' : '1px solid rgba(186, 230, 253, 0.7)',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: rank === 1 ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.85)',
        boxShadow: rank === 1 ? '0 16px 36px -6px rgba(37, 99, 235, 0.2), inset 0 1px 1px #ffffff' : 'var(--shadow-3d)',
      }}
    >
      {/* Top Best Match Ribbon if rank 1 */}
      {rank === 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '-0.25rem' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(hospital);
            }}
            title={`Open optimal emergency GPS navigation route to ${hospital.name}`}
            aria-label={`View optimal route navigation to ${hospital.name}`}
            style={{
              background: 'var(--royal-gradient-3d)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(29, 78, 216, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 78, 216, 0.35)';
            }}
          >
            <Sparkles size={14} className="status-dot-pulse" />
            <span>Optimal Route Match</span>
            <Navigation size={13} style={{ marginLeft: '2px', opacity: 0.95 }} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-navy)' }}>{hospital.name}</h3>
            <StatusBadge status={statusBadge} size="sm" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '3px' }}>
            <MapPin size={15} style={{ color: 'var(--royal-600)', flexShrink: 0 }} />
            <span>{hospital.address}</span>
          </div>
        </div>

        {/* Distance & ETA Badge Container - 3D Glass Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(224, 242, 254, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(186, 230, 253, 0.8)',
            boxShadow: '0 2px 6px rgba(10, 25, 47, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 800, color: 'var(--royal-700)' }}>
            <Navigation size={14} />
            <span>{distanceKm} km</span>
          </div>
          <span style={{ color: 'rgba(147, 197, 253, 0.8)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 800, color: '#047857' }}>
            <Clock size={14} />
            <span>{etaMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Resource Comparison Block */}
      <div>
        <LivePredictionIndicator
          resourceType={requestedResource}
          currentAvailable={currentCount}
          predictedAvailable={predictedCount}
          timeframeMinutes={30}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.55rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '0.35rem' }}>
          <span>Required for dispatch: <strong style={{ color: 'var(--text-navy)' }}>{requiredQuantity} {requestedResource}</strong></span>
          <span>ER Contact: <strong style={{ color: 'var(--text-navy)' }}>{hospital.emergencyContact}</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(186, 230, 253, 0.5)',
          flexWrap: 'wrap',
        }}
      >
        {onBookHospital && (
          <button
            type="button"
            onClick={() => onBookHospital(hospital)}
            className="btn btn-primary"
            style={{
              flex: '1 1 180px',
              backgroundColor: '#E11D48',
              backgroundImage: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 50%, #BE123C 100%)',
              boxShadow: '0 6px 18px -2px rgba(225, 29, 72, 0.45)',
              gap: '6px',
            }}
          >
            <Send size={15} />
            Book Bed / Send Alert
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewHospital(hospital)}
          className="btn btn-secondary"
          style={{ flex: '1 1 130px' }}
        >
          <Eye size={15} />
          View Hospital
        </button>

        <button
          type="button"
          onClick={() => onNavigate(hospital)}
          className="btn btn-outline"
          style={{ flex: '1 1 130px', borderColor: 'var(--royal-600)', color: 'var(--royal-700)' }}
        >
          <Navigation size={15} />
          Navigate
        </button>
      </div>
    </div>
  );
};
