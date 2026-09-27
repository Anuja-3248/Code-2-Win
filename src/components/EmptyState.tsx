import React from 'react';
import { Hospital, RefreshCw, SlidersHorizontal, PhoneCall } from 'lucide-react';

interface EmptyStateProps {
  onRetry: () => void;
  onChangeRequirements: () => void;
  resourceRequested?: string;
  quantityRequested?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onRetry,
  onChangeRequirements,
  resourceRequested = 'ICU Beds',
  quantityRequested = 2,
}) => {
  return (
    <div
      className="resq-card animate-fade-in"
      style={{
        maxWidth: 580,
        margin: '2rem auto',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '16px',
          backgroundColor: 'var(--warning-light)',
          color: 'var(--warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        <Hospital size={30} />
      </div>

      <h2 style={{ fontSize: '1.45rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
        No suitable hospital found nearby
      </h2>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        We couldn't find a nearby hospital that currently matches the requested {quantityRequested} {resourceRequested} within your immediate search radius.
      </p>

      {/* Suggestion notice */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.75rem',
          textAlign: 'left',
          border: '1px solid var(--border-color)',
        }}
      >
        <strong>Recommended Next Steps:</strong>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
          <li>Adjust the required quantity to check single bed / partial capacity</li>
          <li>Select an alternative resource tier (e.g. General Bed with mobile ventilator)</li>
          <li>Contact Central Dispatch (108 / Emergency ER line) for manual diversion</li>
        </ul>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onChangeRequirements}
          className="btn btn-primary"
        >
          <SlidersHorizontal size={16} />
          Change Requirement
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline"
        >
          <RefreshCw size={16} />
          Try Again
        </button>

        <a
          href="tel:108"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          <PhoneCall size={16} />
          Call Central ER Dispatch (108)
        </a>
      </div>
    </div>
  );
};
