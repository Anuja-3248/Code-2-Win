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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          {currentAvailable} {resourceType}
        </span>
        <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
        <span
          style={{
            fontWeight: 600,
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '1px 6px',
            borderRadius: '4px',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
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
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.75rem 0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      {/* Current Availability */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Current Availability
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '2px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: currentAvailable > 0 ? '#1e7e48' : 'var(--emergency)' }}>
            {currentAvailable}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {resourceType} {resourceUnit}
          </span>
        </div>
      </div>

      {/* Transition Arrow Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)' }}>
        <div style={{ width: 18, height: 2, backgroundColor: 'var(--primary-border)' }} />
        <ArrowRight size={16} />
      </div>

      {/* Predicted Availability */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Predicted ({timeframeMinutes}m)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '2px' }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isDrop ? 'var(--text-main)' : isGain ? '#1e7e48' : 'var(--text-main)',
            }}
          >
            ~{predictedAvailable}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            expected
          </span>
        </div>
      </div>
    </div>
  );
};
