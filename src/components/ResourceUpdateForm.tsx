import React, { useState } from 'react';
import { Activity, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import type { ResourceType } from '../types/hospital';

interface ResourceUpdateFormProps {
  onUpdate: (resourceType: ResourceType, count: number) => Promise<boolean>;
  currentIcu: number;
  currentVentilators: number;
  currentGeneral: number;
}

export const ResourceUpdateForm: React.FC<ResourceUpdateFormProps> = ({
  onUpdate,
  currentIcu,
  currentVentilators,
  currentGeneral,
}) => {
  const [resourceType, setResourceType] = useState<ResourceType>('ICU');
  const [availableCount, setAvailableCount] = useState<number>(currentIcu);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync count when dropdown resource changes
  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ResourceType;
    setResourceType(selected);
    if (selected === 'ICU') setAvailableCount(currentIcu);
    else if (selected === 'Ventilator') setAvailableCount(currentVentilators);
    else if (selected === 'General Bed') setAvailableCount(currentGeneral);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (availableCount < 0) {
      setErrorMessage('Available resource count cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdate(resourceType, availableCount);
      if (success) {
        setSuccessMessage('Resource availability updated successfully.');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
      } else {
        setErrorMessage('Failed to update resource. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during resource sync.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resq-card" style={{ border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Activity size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Update Resource Availability</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Broadcast real-time bed & ventilator capacity directly to all active emergency ambulances
          </p>
        </div>
      </div>

      {successMessage && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#1e7e48',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: 'var(--emergency-light)',
            border: '1px solid var(--emergency-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--emergency)',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Resource Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="resource-type-select"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              Resource Category
            </label>
            <select
              id="resource-type-select"
              value={resourceType}
              onChange={handleResourceChange}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            >
              <option value="ICU">ICU Beds (Intensive Care)</option>
              <option value="Ventilator">Ventilators (Mechanical)</option>
              <option value="General Bed">General Ward Beds</option>
            </select>
          </div>

          {/* Available Number Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="available-count-input"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              Available Units / Beds
            </label>
            <input
              id="available-count-input"
              type="number"
              min={0}
              max={500}
              value={availableCount}
              onChange={(e) => setAvailableCount(parseInt(e.target.value, 10) || 0)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="status-dot-pulse" />
                Syncing Availability...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Update Availability
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
