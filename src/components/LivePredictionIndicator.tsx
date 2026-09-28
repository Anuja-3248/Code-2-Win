import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ResourceType } from '../types/hospital';

interface LivePredictionIndicatorProps {
  resourceType: ResourceType;
  currentAvailable: number;
  predictedAvailable: number;
  timeframeMinutes?: number;
  compact?: boolean;
}

export const LivePredictionIndicator: React.FC<LivePredictionIndicatorProps> = ({
  resourceType,
  currentAvailable,
  predictedAvailable,
  timeframeMinutes = 30,
  compact = false,
}) => {
  const resourceUnit = resourceType === 'Ventilator' ? 'units' : 'beds';
  const isDrop = predictedAvailable < currentAvailable;
  const isGain = predictedAvailable > currentAvailable;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 800, color: 'var(--text-navy)' }}>
          {currentAvailable} {resourceType}
        </span>
        <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
        <span
          style={{
            fontWeight: 700,
            color: 'var(--royal-700)',
            backgroundColor: 'rgba(224, 242, 254, 0.8)',
            border: '1px solid rgba(186, 230, 253, 0.9)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 1px 3px rgba(10, 25, 47, 0.04)',
          }}
          title={`Predicted ${predictedAvailable} available in ~${timeframeMinutes} mins`}
        >
          <Sparkles size={11} />
          ~{predictedAvailable} in {timeframeMinutes}m
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'rgba(240, 249, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(186, 230, 253, 0.7)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Current Availability */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Current Verified
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '2px' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: currentAvailable > 0 ? '#047857' : 'var(--emergency)' }}>
            {currentAvailable}
          </span>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-navy)', fontWeight: 600 }}>
            {resourceType} {resourceUnit}
          </span>
        </div>
      </div>

      {/* Transition Arrow Indicator with Royal Blue Accent */}
      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--royal-600)' }}>
        <div style={{ width: 22, height: 2, backgroundColor: 'rgba(147, 197, 253, 0.8)' }} />
        <ArrowRight size={16} />
      </div>

      {/* Predicted Availability */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} style={{ color: 'var(--royal-600)' }} />
          <span style={{ fontSize: '0.725rem', color: 'var(--royal-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Forecast ({timeframeMinutes}m)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '2px' }}>
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: isDrop ? 'var(--text-navy)' : isGain ? '#047857' : 'var(--text-navy)',
            }}
          >
            ~{predictedAvailable}
          </span>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            expected
          </span>
        </div>
      </div>
    </div>
  );
};

