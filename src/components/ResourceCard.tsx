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
        backgroundColor: isSelected ? 'rgba(239, 246, 255, 0.95)' : 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `2px solid ${isSelected ? 'var(--royal-600)' : 'rgba(186, 230, 253, 0.6)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.35rem 1.15rem',
        cursor: 'pointer',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: isSelected
          ? '0 10px 25px -4px rgba(37, 99, 235, 0.2), inset 0 1.5px 1px rgba(255, 255, 255, 1)'
          : 'var(--shadow-sm)',
        transform: isSelected ? 'translateY(-3px)' : 'none',
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
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--royal-gradient-3d)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(29, 78, 216, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
          }}
        >
          <Check size={13} strokeWidth={3} />
        </div>
      )}

      {/* 3D Glass Icon Circle */}
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '12px',
          background: isSelected
            ? 'var(--royal-gradient-3d)'
            : 'linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.6))',
          color: isSelected ? '#ffffff' : 'var(--royal-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isSelected
            ? '0 6px 16px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
            : '0 2px 6px rgba(10, 25, 47, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(186, 230, 253, 0.8)',
          transition: 'all var(--transition-fast)',
        }}
      >
        {getIcon()}
      </div>

      {/* Card Info */}
      <div>
        <h4
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: isSelected ? 'var(--royal-800)' : 'var(--text-navy)',
            marginBottom: '4px',
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: '0.835rem',
            color: isSelected ? 'var(--navy-700)' : 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

