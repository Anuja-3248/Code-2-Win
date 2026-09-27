import React from 'react';
import { CheckCircle2, AlertTriangle, Activity, AlertCircle, Clock } from 'lucide-react';

export type StatusBadgeVariant =
  | 'Suitable'
  | 'Available'
  | 'High Demand'
  | 'Critical Capacity'
  | 'Operational'
  | 'Limited'
  | 'Diversion';

interface StatusBadgeProps {
  status: StatusBadgeVariant;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Available':
        return {
          className: 'badge-success',
          icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
          text: 'Available',
          dotColor: '#4CAF7D',
        };
      case 'Suitable':
        return {
          className: 'badge-success',
          icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
          text: 'Suitable Match',
          dotColor: '#4CAF7D',
        };
      case 'Operational':
        return {
          className: 'badge-success',
          icon: <Activity size={size === 'sm' ? 12 : 14} />,
          text: 'Operational',
          dotColor: '#4CAF7D',
        };
      case 'High Demand':
      case 'Limited':
        return {
          className: 'badge-warning',
          icon: <AlertTriangle size={size === 'sm' ? 12 : 14} />,
          text: status === 'High Demand' ? 'High Demand' : 'Limited Capacity',
          dotColor: '#F4B942',
        };
      case 'Critical Capacity':
      case 'Diversion':
        return {
          className: 'badge-emergency',
          icon: <AlertCircle size={size === 'sm' ? 12 : 14} />,
          text: status === 'Critical Capacity' ? 'Critical Capacity' : 'On Diversion',
          dotColor: '#D9534F',
        };
      default:
        return {
          className: 'badge-neutral',
          icon: <Clock size={size === 'sm' ? 12 : 14} />,
          text: status,
          dotColor: '#667085',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`badge ${config.className}`}
      style={{
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.7rem',
        fontSize: size === 'sm' ? '0.725rem' : '0.8rem',
      }}
    >
      <span
        className="status-dot"
        style={{
          backgroundColor: config.dotColor,
          width: size === 'sm' ? 6 : 7,
          height: size === 'sm' ? 6 : 7,
        }}
      />
      {config.text}
    </span>
  );
};
