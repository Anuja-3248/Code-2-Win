import React from 'react';
import { Bed, Activity, Wind, Check } from 'lucide-react';
import type { ResourceType } from '../types/hospital';

interface ResourceCardProps {
  type: ResourceType;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: (type: ResourceType) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  type,
  title,
  description,
  isSelected,
  onSelect,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'General Bed':
        return <Bed size={26} />;
      case 'ICU':
        return <Activity size={26} />;
      case 'Ventilator':
        return <Wind size={26} />;
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(type);
        }
      }}
      style={{
        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1rem',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        outline: 'none',
      }}
      className="resq-resource-card"
    >
      {/* Selection Checkmark Indicator */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      )}

      {/* Icon Circle */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '10px',
          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
          color: isSelected ? '#ffffff' : 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)',
        }}
      >
        {getIcon()}
      </div>

      {/* Card Info */}
      <div>
        <h4
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: isSelected ? 'var(--primary-hover)' : 'var(--text-main)',
            marginBottom: '4px',
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: '0.825rem',
            color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)',
            lineHeight: 1.35,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
