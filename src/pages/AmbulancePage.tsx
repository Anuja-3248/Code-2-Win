import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ambulance, Search, ArrowRight } from 'lucide-react';
import type { ResourceType } from '../types/hospital';
import type { LocationCoordinates, EmergencyRequest } from '../types/emergency';
import { ResourceCard } from '../components/ResourceCard';
import { QuantitySelector } from '../components/QuantitySelector';
import { LocationCard } from '../components/LocationCard';
import { LoadingState } from '../components/LoadingState';
import { CONFIG } from '../services/config';

import { AmbulanceUnitHeader } from '../components/AmbulanceUnitHeader';

export const AmbulancePage: React.FC = () => {
  const navigate = useNavigate();

  // Emergency Form State
  const [resource, setResource] = useState<ResourceType>('ICU');
  const [quantity, setQuantity] = useState<number>(2);
  const [location, setLocation] = useState<LocationCoordinates>({
    latitude: CONFIG.DEFAULT_LOCATION.latitude,
    longitude: CONFIG.DEFAULT_LOCATION.longitude,
    locationName: CONFIG.DEFAULT_LOCATION.name,
    accuracyMeters: 10,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    const emergencyRequest: EmergencyRequest = {
      resource,
      quantity,
      latitude: location.latitude,
      longitude: location.longitude,
      locationName: location.locationName,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem('resqlink_active_request', JSON.stringify(emergencyRequest));
    navigate('/ambulance/results', { state: { request: emergencyRequest } });
  };

  if (isLoading) {
    return (
      <div className="container-narrow" style={{ padding: '2rem 1.25rem' }}>
        <LoadingState onComplete={handleLoadingComplete} durationMs={2200} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-narrow">
        {/* Permanent Ambulance Unit Header */}
        <AmbulanceUnitHeader />

        {/* Page Header */}
        <div style={{ marginBottom: '2.25rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <span className="badge badge-teal" style={{ padding: '0.4rem 0.95rem', fontSize: '0.825rem' }}>
              <Ambulance size={15} style={{ color: 'var(--royal-600)' }} />
              <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>AMBULANCE EMERGENCY DISPATCH</span>
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4vw, 2.75rem)',
              fontWeight: 850,
              color: 'var(--text-navy)',
              marginBottom: '0.65rem',
              letterSpacing: '-0.03em',
            }}
          >
            Find the right hospital
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Specify patient triage requirements. We match nearby facilities using live SQL capacity feeds and 30-minute predictive triage models.
          </p>
        </div>

        {/* Large Emergency Request Card - 3D Glass Coated */}
        <form onSubmit={handleSubmit}>
          <div
            className="resq-card"
            style={{
              padding: '2.5rem 2.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.25rem',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: 'var(--shadow-3d)',
              backgroundColor: 'rgba(255, 255, 255, 0.86)',
            }}
          >
            {/* Step 1: Select Resource */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--text-navy)',
                  }}
                >
                  Step 1 — What does the patient need?
                </label>
                <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>Required</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '1.1rem',
                }}
              >
                <ResourceCard
                  type="ICU"
                  title="ICU Bed"
                  description="Critical care bed with continuous monitoring"
                  isSelected={resource === 'ICU'}
                  onSelect={(t) => setResource(t)}
                />

                <ResourceCard
                  type="Ventilator"
                  title="Ventilator"
                  description="Advanced mechanical respiratory support"
                  isSelected={resource === 'Ventilator'}
                  onSelect={(t) => setResource(t)}
                />

                <ResourceCard
                  type="General Bed"
                  title="General Bed"
                  description="Standard in-patient emergency admission"
                  isSelected={resource === 'General Bed'}
                  onSelect={(t) => setResource(t)}
                />
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(186, 230, 253, 0.6)' }} />

            {/* Step 2: Quantity Selector */}
            <div>
              <QuantitySelector
                value={quantity}
                onChange={(q) => setQuantity(q)}
                min={1}
                max={10}
                label="Step 2 — How many are required?"
                helperText="Enter the number of units required for this emergency dispatch."
              />
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(186, 230, 253, 0.6)' }} />

            {/* Step 3: Ambulance Location */}
            <div>
              <LocationCard
                location={location}
                onLocationChange={(newLoc) => setLocation(newLoc)}
              />
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(186, 230, 253, 0.6)' }} />

            {/* Step 4: Submit Button & Note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  fontSize: '1.15rem',
                  padding: '1.1rem 1.75rem',
                  gap: '0.75rem',
                }}
              >
                <Search size={22} />
                Find Suitable Hospitals
                <ArrowRight size={20} />
              </button>

              <p
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                Your request will be matched with nearby hospitals based on real-time resource availability and predicted 30-minute capacity.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
