import React, { useCallback, useEffect, useState } from 'react';
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
import { BookingModal } from '../components/BookingModal';
import { ActiveBookingBanner } from '../components/ActiveBookingBanner';
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
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState<Hospital | null>(null);

  const executeSearch = useCallback(async (reqToUse = request) => {
    setIsSearching(true);
    try {
      const result = await ApiService.searchSuitableHospitals(reqToUse);
      setSearchResult(result);
    } catch (err) {
      console.error('Search matching failed', err);
    } finally {
      setIsSearching(false);
    }
  }, [request]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) {
        await executeSearch(request);
      }
    };
    run();

    // If hospital resources get updated in another tab/component, refresh matches automatically
    const handleHospitalUpdate = () => {
      executeSearch(request);
    };
    window.addEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
    };
  }, [request, executeSearch]);

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
        {/* Active Inbound Booking Live Radar & Status HUD */}
        <ActiveBookingBanner
          onOpenNavigation={(b) => {
            const found = matches.find((m) => m.hospital.id === b.targetHospitalId);
            if (found) setSelectedHospitalForNavigation(found.hospital);
          }}
        />

        {/* Top Breadcrumb / Return to Search */}
        <div className="reveal-slide-down" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link
            to="/ambulance"
            className="btn btn-outline btn-sm"
            style={{ gap: '0.45rem' }}
          >
            <ArrowLeft size={15} />
            Modify Emergency Request
          </Link>

          <button
            type="button"
            onClick={() => executeSearch(request)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.45rem' }}
          >
            <RefreshCw size={14} />
            Refresh Hospital Mesh
          </button>
        </div>

        {/* Request Summary Top Card - 3D Glass Coated */}
        <div
          className="resq-card reveal-slide-down delay-100"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            border: '1.5px solid rgba(186, 230, 253, 0.8)',
            marginBottom: '2rem',
            padding: '1.4rem 1.75rem',
            boxShadow: 'var(--shadow-3d)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--royal-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Ambulance Request Summary
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resource:</span>
                  <strong style={{ color: 'var(--royal-700)', fontSize: '1.05rem' }}>{request.resource}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Quantity:</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-navy)' }}>{request.quantity} units</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={16} style={{ color: 'var(--royal-600)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Location:</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-navy)' }}>{request.locationName || 'Pune, Maharashtra'}</strong>
                </div>
              </div>
            </div>

            <Link
              to="/ambulance"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.825rem', gap: '5px' }}
            >
              <SlidersHorizontal size={14} />
              Change Query
            </Link>
          </div>
        </div>

        {/* Results Heading */}
        <div className="reveal-slide-up delay-200" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Suitable Hospitals Nearby</h1>
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
              gap: '1.35rem',
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
                onBookHospital={(hosp) => setSelectedHospitalForBooking(hosp)}
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
          onBookHospital={(hosp) => setSelectedHospitalForBooking(hosp)}
        />
      )}

      {/* Navigation Modal */}
      {selectedHospitalForNavigation && (
        <NavigationModal
          hospital={selectedHospitalForNavigation}
          onClose={() => setSelectedHospitalForNavigation(null)}
        />
      )}

      {/* Emergency Bed Booking Modal */}
      {selectedHospitalForBooking && (
        <BookingModal
          hospital={selectedHospitalForBooking}
          request={request}
          onClose={() => setSelectedHospitalForBooking(null)}
          onBookingSuccess={() => {
            setSelectedHospitalForBooking(null);
          }}
        />
      )}
    </div>
  );
};
