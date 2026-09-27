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
        gap: '1.25rem',
        border: rank === 1 ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      {/* Top Best Match Ribbon if rank 1 */}
      {rank === 1 && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 16,
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={11} />
          Optimal Route Match
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{hospital.name}</h3>
            <StatusBadge status={statusBadge} size="sm" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '3px' }}>
            <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>{hospital.address}</span>
          </div>
        </div>

        {/* Distance & ETA Badge Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            <Navigation size={14} />
            <span>{distanceKm} km</span>
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#1e7e48' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Required for patient: <strong>{requiredQuantity} {requestedResource}</strong></span>
          <span>ER Contact: <strong>{hospital.emergencyContact}</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-color)',
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
          Navigate
        </button>
      </div>
    </div>
  );
};
