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
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem' }}>
            <span className="badge badge-emergency">
              <Ambulance size={14} />
              Ambulance Emergency Dispatch
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.35rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Find the right hospital
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
            Tell us what the patient needs and we'll identify suitable nearby hospitals using real-time capacity and machine learning predictions.
          </p>
        </div>

        {/* Large Emergency Request Card - 3D Glass Coated */}
        <form onSubmit={handleSubmit}>
          <div
            className="resq-card"
            style={{
              padding: '2.25rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.25rem',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: 'var(--shadow-3d)',
              backgroundColor: 'rgba(255, 255, 255, 0.82)',
            }}
          >
            {/* Step 1: Select Resource */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--text-navy)',
                  }}
                >
                  Step 1 — What does the patient need?
                </label>
                <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>Required</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '1rem',
                }}
              >
                <ResourceCard
                  type="ICU"
                  title="ICU"
                  description="Critical care bed required with continuous telemetry"
                  isSelected={resource === 'ICU'}
                  onSelect={(t) => setResource(t)}
                />

                <ResourceCard
                  type="Ventilator"
                  title="Ventilator"
                  description="Advanced mechanical respiratory support system"
                  isSelected={resource === 'Ventilator'}
                  onSelect={(t) => setResource(t)}
                />

                <ResourceCard
                  type="General Bed"
                  title="General Bed"
                  description="Standard in-patient emergency admission bed"
                  isSelected={resource === 'General Bed'}
                  onSelect={(t) => setResource(t)}
                />
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(186, 230, 253, 0.5)' }} />

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

            <div style={{ height: 1, backgroundColor: 'rgba(186, 230, 253, 0.5)' }} />

            {/* Step 3: Ambulance Location */}
            <div>
              <LocationCard
                location={location}
                onLocationChange={(newLoc) => setLocation(newLoc)}
              />
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(186, 230, 253, 0.5)' }} />

            {/* Step 4: Submit Button & Note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  fontSize: '1.15rem',
                  padding: '1.1rem 1.75rem',
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
                  lineHeight: 1.45,
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
