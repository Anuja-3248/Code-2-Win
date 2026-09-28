import React from 'react';
import { MapPin, Navigation, Eye, Clock, Sparkles } from 'lucide-react';
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

  return (
    <div
      className="resq-card resq-card-interactive animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.35rem',
        border: rank === 1 ? '2px solid var(--royal-600)' : '1px solid rgba(186, 230, 253, 0.7)',
        position: 'relative',
        backgroundColor: rank === 1 ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.82)',
        boxShadow: rank === 1 ? '0 16px 36px -6px rgba(37, 99, 235, 0.18), inset 0 1px 1px #ffffff' : 'var(--shadow-3d)',
      }}
    >
      {/* Top Best Match Ribbon if rank 1 */}
      {rank === 1 && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 18,
            background: 'var(--royal-gradient-3d)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Sparkles size={12} />
          Optimal Route Match
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)' }}>{hospital.name}</h3>
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
            backgroundColor: 'rgba(224, 242, 254, 0.7)',
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
          gap: '0.85rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(186, 230, 253, 0.5)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => onViewHospital(hospital)}
          className="btn btn-secondary"
          style={{ flex: 1, minWidth: '130px' }}
        >
          <Eye size={16} />
          View Hospital
        </button>

        <button
          type="button"
          onClick={() => onNavigate(hospital)}
          className="btn btn-primary"
          style={{ flex: 1, minWidth: '130px' }}
        >
          <Navigation size={16} />
          Navigate Now
        </button>
      </div>
    </div>
  );
};
