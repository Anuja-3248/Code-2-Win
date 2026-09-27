import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import type { EmergencyRequest, EmergencySearchResult } from '../types/emergency';
import type { Hospital } from '../types/hospital';
import { ApiService } from '../services/apiService';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalDetailModal } from '../components/HospitalDetailModal';
import { NavigationModal } from '../components/NavigationModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { CONFIG } from '../services/config';

export const HospitalResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve search request from location state or session storage
  const [request] = useState<EmergencyRequest>(() => {
    if (location.state?.request) {
      return location.state.request;
    }
    const stored = sessionStorage.getItem('resqlink_active_request');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      resource: 'ICU',
      quantity: 2,
      latitude: CONFIG.DEFAULT_LOCATION.latitude,
      longitude: CONFIG.DEFAULT_LOCATION.longitude,
      locationName: CONFIG.DEFAULT_LOCATION.name,
      timestamp: new Date().toISOString(),
    };
  });

  const [searchResult, setSearchResult] = useState<EmergencySearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  // Modals state
  const [selectedHospitalForDetails, setSelectedHospitalForDetails] = useState<Hospital | null>(null);
  const [selectedHospitalForNavigation, setSelectedHospitalForNavigation] = useState<Hospital | null>(null);

  const executeSearch = async (reqToUse = request) => {
    setIsSearching(true);
    try {
      const result = await ApiService.searchSuitableHospitals(reqToUse);
      setSearchResult(result);
    } catch (err) {
      console.error('Search matching failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    executeSearch(request);

    // If hospital resources get updated in another tab/component, refresh matches automatically
    const handleHospitalUpdate = () => {
      executeSearch(request);
    };
    window.addEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
    return () => window.removeEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
  }, [request]);

  const handleNavigateTrigger = (hospital: Hospital) => {
    setSelectedHospitalForDetails(null);
    setSelectedHospitalForNavigation(hospital);
  };

  if (isSearching) {
    return (
      <div className="container-responsive" style={{ padding: '3rem 1.5rem' }}>
        <LoadingState onComplete={() => setIsSearching(false)} durationMs={1800} />
      </div>
    );
  }

  const matches = searchResult?.suitableHospitals || [];

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-responsive">
        {/* Top Breadcrumb / Return to Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link
            to="/ambulance"
            className="btn btn-outline btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <ArrowLeft size={15} />
            Modify Emergency Request
          </Link>

          <button
            type="button"
            onClick={() => executeSearch(request)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={14} />
            Refresh Hospital Mesh
          </button>
        </div>

        {/* Request Summary Top Card */}
        <div
          className="resq-card"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Ambulance Request Summary
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resource:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{request.resource}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Required Quantity:</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{request.quantity} units</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Location:</span>
                  <strong style={{ fontSize: '0.95rem' }}>{request.locationName || 'Pune, Maharashtra'}</strong>
                </div>
              </div>
            </div>

            <Link
              to="/ambulance"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.8rem', gap: '4px' }}
            >
              <SlidersHorizontal size={13} />
              Change
            </Link>
          </div>
        </div>

        {/* Results Heading */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Suitable Hospitals Nearby</h1>
            <span className="badge badge-teal">
              {matches.length} Suitable {matches.length === 1 ? 'Hospital' : 'Hospitals'}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Ranked by immediate availability, machine learning predicted capacity at arrival, and travel distance.
          </p>
        </div>

        {/* Results List or Empty State */}
        {matches.length === 0 ? (
          <EmptyState
            resourceRequested={`${request.resource}s`}
            quantityRequested={request.quantity}
            onRetry={() => executeSearch(request)}
            onChangeRequirements={() => navigate('/ambulance')}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.25rem',
            }}
          >
            {matches.map((match, index) => (
              <HospitalCard
                key={match.hospital.id}
                rank={index + 1}
                hospital={match.hospital}
                requestedResource={request.resource}
                requiredQuantity={request.quantity}
                statusBadge={match.statusBadge}
                distanceKm={match.distanceKm}
                etaMinutes={match.etaMinutes}
                onViewHospital={(hosp) => setSelectedHospitalForDetails(hosp)}
                onNavigate={handleNavigateTrigger}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hospital Details Modal */}
      {selectedHospitalForDetails && (
        <HospitalDetailModal
          hospital={selectedHospitalForDetails}
          requestedResource={request.resource}
          onClose={() => setSelectedHospitalForDetails(null)}
          onNavigate={handleNavigateTrigger}
        />
      )}

      {/* Navigation Modal */}
      {selectedHospitalForNavigation && (
        <NavigationModal
          hospital={selectedHospitalForNavigation}
          onClose={() => setSelectedHospitalForNavigation(null)}
        />
      )}
    </div>
  );
};
