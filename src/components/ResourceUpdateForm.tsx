import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, RefreshCw, AlertCircle, MapPin, Sliders, Edit3 } from 'lucide-react';
import type { Hospital, ResourceType } from '../types/hospital';

interface ResourceUpdateFormProps {
  hospital: Hospital;
  onUpdate: (resourceType: ResourceType, count: number) => Promise<boolean>;
  onSaveFullTelemetry: (payload: any) => Promise<boolean>;
}

export const ResourceUpdateForm: React.FC<ResourceUpdateFormProps> = ({
  hospital,
  onUpdate,
  onSaveFullTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'full'>('full');

  // Quick resource update state
  const [resourceType, setResourceType] = useState<ResourceType>('ICU');
  const [availableCount, setAvailableCount] = useState<number>(hospital.icuAvailable);

  // Full telemetry state (matching deepseeck_db.html)
  const [hospitalName, setHospitalName] = useState(hospital.name);
  const [address, setAddress] = useState(hospital.address);
  const [latitude, setLatitude] = useState<number | string>(hospital.latitude);
  const [longitude, setLongitude] = useState<number | string>(hospital.longitude);
  const [icuTotal, setIcuTotal] = useState<number | string>(hospital.icuTotal);
  const [icuAvailable, setIcuAvailable] = useState<number | string>(hospital.icuAvailable);
  const [ventilatorTotal, setVentilatorTotal] = useState<number | string>(hospital.ventilatorsTotal);
  const [ventilatorsAvailable, setVentilatorsAvailable] = useState<number | string>(hospital.ventilatorsAvailable);
  const [generalBedsAvailable, setGeneralBedsAvailable] = useState<number | string>(hospital.generalBedsAvailable);
  const [occupancyRate, setOccupancyRate] = useState<number | string>(hospital.occupancyRate);
  const [admissionsLast30Min, setAdmissionsLast30Min] = useState<number | string>(hospital.admissionsLast30Min);
  const [dischargesLast30Min, setDischargesLast30Min] = useState<number | string>(hospital.dischargesLast30Min);
  const [emergencyArrivalsLast30Min, setEmergencyArrivalsLast30Min] = useState<number | string>(hospital.emergencyArrivalsLast30Min);
  const [icuAvailable30MinLater, setIcuAvailable30MinLater] = useState<number | string>(hospital.predictedIcuAvailable30Min);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep fields synced if hospital prop updates
  useEffect(() => {
    setHospitalName(hospital.name);
    setAddress(hospital.address);
    setLatitude(hospital.latitude);
    setLongitude(hospital.longitude);
    setIcuTotal(hospital.icuTotal);
    setIcuAvailable(hospital.icuAvailable);
    setVentilatorTotal(hospital.ventilatorsTotal);
    setVentilatorsAvailable(hospital.ventilatorsAvailable);
    setGeneralBedsAvailable(hospital.generalBedsAvailable);
    setOccupancyRate(hospital.occupancyRate);
    setAdmissionsLast30Min(hospital.admissionsLast30Min);
    setDischargesLast30Min(hospital.dischargesLast30Min);
    setEmergencyArrivalsLast30Min(hospital.emergencyArrivalsLast30Min);
    setIcuAvailable30MinLater(hospital.predictedIcuAvailable30Min);
  }, [hospital]);

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ResourceType;
    setResourceType(selected);
    if (selected === 'ICU') setAvailableCount(hospital.icuAvailable);
    else if (selected === 'Ventilator') setAvailableCount(hospital.ventilatorsAvailable);
    else if (selected === 'General Bed') setAvailableCount(hospital.generalBedsAvailable);
    setSuccessMessage(null);
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
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
        setSuccessMessage('Resource availability synced to database successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage('Failed to update resource. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during resource sync.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setSuccessMessage('📍 Fetching GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
        setSuccessMessage(`✅ Location updated: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      (err) => {
        setErrorMessage(`❌ Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFullSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name: hospitalName,
        hospital_name: hospitalName,
        address: address,
        latitude: typeof latitude === 'string' ? parseFloat(latitude) : latitude,
        longitude: typeof longitude === 'string' ? parseFloat(longitude) : longitude,
        icuTotal: typeof icuTotal === 'string' ? parseInt(icuTotal, 10) : icuTotal,
        icu_total: typeof icuTotal === 'string' ? parseInt(icuTotal, 10) : icuTotal,
        icuAvailable: typeof icuAvailable === 'string' ? parseInt(icuAvailable, 10) : icuAvailable,
        icu_available: typeof icuAvailable === 'string' ? parseInt(icuAvailable, 10) : icuAvailable,
        ventilatorsTotal: typeof ventilatorTotal === 'string' ? parseInt(ventilatorTotal, 10) : ventilatorTotal,
        ventilator_total: typeof ventilatorTotal === 'string' ? parseInt(ventilatorTotal, 10) : ventilatorTotal,
        ventilatorsAvailable: typeof ventilatorsAvailable === 'string' ? parseInt(ventilatorsAvailable, 10) : ventilatorsAvailable,
        ventilators_available: typeof ventilatorsAvailable === 'string' ? parseInt(ventilatorsAvailable, 10) : ventilatorsAvailable,
        generalBedsAvailable: typeof generalBedsAvailable === 'string' ? parseInt(generalBedsAvailable, 10) : generalBedsAvailable,
        general_beds_available: typeof generalBedsAvailable === 'string' ? parseInt(generalBedsAvailable, 10) : generalBedsAvailable,
        occupancyRate: typeof occupancyRate === 'string' ? parseFloat(occupancyRate) : occupancyRate,
        occupancy_rate: typeof occupancyRate === 'string' ? parseFloat(occupancyRate) : occupancyRate,
        admissionsLast30Min: typeof admissionsLast30Min === 'string' ? parseInt(admissionsLast30Min, 10) : admissionsLast30Min,
        admission_last_30min: typeof admissionsLast30Min === 'string' ? parseInt(admissionsLast30Min, 10) : admissionsLast30Min,
        dischargesLast30Min: typeof dischargesLast30Min === 'string' ? parseInt(dischargesLast30Min, 10) : dischargesLast30Min,
        discharge_last_30min: typeof dischargesLast30Min === 'string' ? parseInt(dischargesLast30Min, 10) : dischargesLast30Min,
        emergencyArrivalsLast30Min: typeof emergencyArrivalsLast30Min === 'string' ? parseInt(emergencyArrivalsLast30Min, 10) : emergencyArrivalsLast30Min,
        emergency_arrival_last_30min: typeof emergencyArrivalsLast30Min === 'string' ? parseInt(emergencyArrivalsLast30Min, 10) : emergencyArrivalsLast30Min,
        predictedIcuAvailable30Min: typeof icuAvailable30MinLater === 'string' ? parseInt(icuAvailable30MinLater, 10) : icuAvailable30MinLater,
        icu_available_30min_later: typeof icuAvailable30MinLater === 'string' ? parseInt(icuAvailable30MinLater, 10) : icuAvailable30MinLater,
      };

      const success = await onSaveFullTelemetry(payload);
      if (success) {
        setSuccessMessage('✅ Full telemetry saved to Firestore database!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage('Failed to save telemetry. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving full telemetry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="resq-card"
      style={{
        border: '1.5px solid rgba(186, 230, 253, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        boxShadow: 'var(--shadow-3d)',
        padding: '1.75rem',
      }}
    >
      {/* Header & Mode Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'var(--royal-gradient-3d)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(29, 78, 216, 0.3)',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-navy)' }}>Update Resource Telemetry</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Sync live capacity directly to cloud database & emergency dispatch
            </p>
          </div>
        </div>

        {/* Tab Buttons - 3D Glass Pill */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(224, 242, 254, 0.6)', border: '1px solid rgba(186, 230, 253, 0.8)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('full')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'full' ? '#fff' : 'transparent',
              color: activeTab === 'full' ? 'var(--royal-700)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: activeTab === 'full' ? '0 2px 6px rgba(10, 25, 47, 0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Edit3 size={13} /> Full Telemetry Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'quick' ? '#fff' : 'transparent',
              color: activeTab === 'quick' ? 'var(--royal-700)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: activeTab === 'quick' ? '0 2px 6px rgba(10, 25, 47, 0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Sliders size={13} /> Quick Adjust
          </button>
        </div>
      </div>

      {/* Alert Banners */}
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

      {/* QUICK SYNC TAB */}
      {activeTab === 'quick' && (
        <form onSubmit={handleQuickSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="resource-type-select" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="available-count-input" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="status-dot-pulse" />
                  Syncing...
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
      )}

      {/* FULL TELEMETRY TABLE TAB (matching deepseeck_db.html) */}
      {activeTab === 'full' && (
        <form onSubmit={handleFullSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Hospital Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Hospital Name</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Address */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full hospital address"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Latitude & Longitude */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Use My Location Button */}
            <div style={{ gridColumn: 'span 2' }}>
              <button
                type="button"
                onClick={handleGetLocation}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', gap: '6px', justifyContent: 'center' }}
              >
                <MapPin size={14} /> Use My Current Location
              </button>
            </div>

            {/* ICU Beds */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Total ICU Beds</label>
              <input
                type="number"
                required
                min={0}
                value={icuTotal}
                onChange={(e) => setIcuTotal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Current ICU Available</label>
              <input
                type="number"
                required
                min={0}
                value={icuAvailable}
                onChange={(e) => setIcuAvailable(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Ventilators */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Total Ventilators</label>
              <input
                type="number"
                required
                min={0}
                value={ventilatorTotal}
                onChange={(e) => setVentilatorTotal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Current Ventilators Available</label>
              <input
                type="number"
                required
                min={0}
                value={ventilatorsAvailable}
                onChange={(e) => setVentilatorsAvailable(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* General Beds & Occupancy Rate */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>General Beds Available</label>
              <input
                type="number"
                required
                min={0}
                value={generalBedsAvailable}
                onChange={(e) => setGeneralBedsAvailable(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Occupancy Rate (%)</label>
              <input
                type="number"
                step="any"
                required
                min={0}
                max={100}
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* 30-min dynamics */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Admissions (last 30m)</label>
              <input
                type="number"
                required
                min={0}
                value={admissionsLast30Min}
                onChange={(e) => setAdmissionsLast30Min(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Discharges (last 30m)</label>
              <input
                type="number"
                required
                min={0}
                value={dischargesLast30Min}
                onChange={(e) => setDischargesLast30Min(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Emergency Arrivals (30m)</label>
              <input
                type="number"
                required
                min={0}
                value={emergencyArrivalsLast30Min}
                onChange={(e) => setEmergencyArrivalsLast30Min(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>ICU Available (30m later)</label>
              <input
                type="number"
                required
                min={0}
                value={icuAvailable30MinLater}
                onChange={(e) => setIcuAvailable30MinLater(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem', gap: '8px' }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={18} className="status-dot-pulse" /> Saving Telemetry to Database...
              </>
            ) : (
              <>💾 Save Hospital Telemetry</>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
