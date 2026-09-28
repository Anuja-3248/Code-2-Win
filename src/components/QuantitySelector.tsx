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

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1.5px solid rgba(186, 230, 253, 0.8)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(10, 25, 47, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label="Decrease quantity"
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: value <= min ? 'transparent' : 'rgba(240, 249, 255, 0.8)',
              color: value <= min ? 'var(--text-muted)' : 'var(--text-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value <= min ? 'not-allowed' : 'pointer',
              border: value <= min ? '1px solid transparent' : '1px solid rgba(186, 230, 253, 0.6)',
              boxShadow: value <= min ? 'none' : '0 2px 4px rgba(10, 25, 47, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Minus size={18} />
          </button>

          {/* Value Display */}
          <div
            style={{
              minWidth: 54,
              textAlign: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--royal-700)',
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
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: value >= max ? 'transparent' : 'var(--royal-gradient-3d)',
              color: value >= max ? 'var(--text-muted)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value >= max ? 'not-allowed' : 'pointer',
              border: value >= max ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: value >= max ? 'none' : '0 4px 10px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        <span style={{ fontSize: '0.9rem', color: 'var(--text-navy)', fontWeight: 600 }}>
          {value === 1 ? 'Patient unit required' : 'Patient units required'}
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
