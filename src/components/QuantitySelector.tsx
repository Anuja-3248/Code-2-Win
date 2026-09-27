import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  label?: string;
  helperText?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label = 'How many are required?',
  helperText = 'Enter the number of resources required for this emergency.',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {label && (
        <label
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--text-main)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label="Decrease quantity"
            style={{
              width: 38,
              height: 38,
              borderRadius: '6px',
              backgroundColor: value <= min ? 'transparent' : 'var(--bg-subtle)',
              color: value <= min ? 'var(--text-muted)' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value <= min ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Minus size={18} />
          </button>

          {/* Value Display */}
          <div
            style={{
              minWidth: 48,
              textAlign: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--primary)',
              userSelect: 'none',
            }}
          >
            {value}
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            aria-label="Increase quantity"
            style={{
              width: 38,
              height: 38,
              borderRadius: '6px',
              backgroundColor: value >= max ? 'transparent' : 'var(--primary-light)',
              color: value >= max ? 'var(--text-muted)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value >= max ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {value === 1 ? 'Patient unit' : 'Patient units'}
        </span>
      </div>

      {helperText && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};
