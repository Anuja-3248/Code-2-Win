import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertCircle, Clock, Save } from 'lucide-react';
import type { Hospital, ResourceType } from '../types/hospital';
import { calculateTelemetryMetrics, validateTelemetryInputs, get30MinSlotKey } from '../services/hospitalService';

interface ResourceUpdateFormProps {
  hospital: Hospital;
  onUpdate?: (resourceType: ResourceType, count: number) => Promise<boolean>;
  onSaveFullTelemetry: (payload: any) => Promise<boolean>;
}

export const ResourceUpdateForm: React.FC<ResourceUpdateFormProps> = ({
  hospital,
  onSaveFullTelemetry,
}) => {
  // Active 30-min slot key
  const [currentSlotKey, setCurrentSlotKey] = useState(get30MinSlotKey());

  // Input states
  const [icuAvailable, setIcuAvailable] = useState<number | string>(hospital.icuAvailable ?? 0);
  const [icuOccupied, setIcuOccupied] = useState<number | string>(hospital.icuOccupied ?? 0);

  const [ventilatorAvailable, setVentilatorAvailable] = useState<number | string>(hospital.ventilatorsAvailable ?? 0);
  const [ventilatorOccupied, setVentilatorOccupied] = useState<number | string>(hospital.ventilatorsOccupied ?? 0);

  const [simpleBedsAvailable, setSimpleBedsAvailable] = useState<number | string>(hospital.generalBedsAvailable ?? 0);
  const [simpleBedsOccupied, setSimpleBedsOccupied] = useState<number | string>(hospital.generalBedsOccupied ?? 0);

  const [admissionsIcu30Min, setAdmissionsIcu30Min] = useState<number | string>(hospital.admissionsIcu30min ?? hospital.admissionsLast30Min ?? 0);
  const [admissionsVentilator30Min, setAdmissionsVentilator30Min] = useState<number | string>(hospital.admissionsVentilator30min ?? 0);
  const [admissionsSimpleBeds30Min, setAdmissionsSimpleBeds30Min] = useState<number | string>(hospital.admissionsSimpleBeds30min ?? 0);

  const [dischargesIcu30Min, setDischargesIcu30Min] = useState<number | string>(hospital.dischargesIcu30min ?? hospital.dischargesLast30Min ?? 0);
  const [dischargesVentilator30Min, setDischargesVentilator30Min] = useState<number | string>(hospital.dischargesVentilator30min ?? 0);
  const [dischargesSimpleBeds30Min, setDischargesSimpleBeds30Min] = useState<number | string>(hospital.dischargesSimpleBeds30min ?? 0);

  const [emergencyArrivals30Min, setEmergencyArrivals30Min] = useState<number | string>(hospital.emergencyArrivals30min ?? hospital.emergencyArrivalsLast30Min ?? 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prevHospitalIdRef = React.useRef(hospital.id);

  // Sync inputs if hospital prop changes
  useEffect(() => {
    if (prevHospitalIdRef.current !== hospital.id) {
      prevHospitalIdRef.current = hospital.id;
      setIcuAvailable(hospital.icuAvailable ?? 0);
      setIcuOccupied(hospital.icuOccupied ?? 0);
      setVentilatorAvailable(hospital.ventilatorsAvailable ?? 0);
      setVentilatorOccupied(hospital.ventilatorsOccupied ?? 0);
      setSimpleBedsAvailable(hospital.generalBedsAvailable ?? 0);
      setSimpleBedsOccupied(hospital.generalBedsOccupied ?? 0);

      setAdmissionsIcu30Min(hospital.admissionsIcu30min ?? hospital.admissionsLast30Min ?? 0);
      setAdmissionsVentilator30Min(hospital.admissionsVentilator30min ?? 0);
      setAdmissionsSimpleBeds30Min(hospital.admissionsSimpleBeds30min ?? 0);

      setDischargesIcu30Min(hospital.dischargesIcu30min ?? hospital.dischargesLast30Min ?? 0);
      setDischargesVentilator30Min(hospital.dischargesVentilator30min ?? 0);
      setDischargesSimpleBeds30Min(hospital.dischargesSimpleBeds30min ?? 0);

      setEmergencyArrivals30Min(hospital.emergencyArrivals30min ?? hospital.emergencyArrivalsLast30Min ?? 0);
    }
  }, [hospital]);

  // Keep 30-min slot key updated
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlotKey(get30MinSlotKey());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Parse numbers safely for real-time live preview
  const numIcuAvail = Math.max(0, Number(icuAvailable) || 0);
  const numIcuOcc = Math.max(0, Number(icuOccupied) || 0);
  const numVentAvail = Math.max(0, Number(ventilatorAvailable) || 0);
  const numVentOcc = Math.max(0, Number(ventilatorOccupied) || 0);
  const numBedAvail = Math.max(0, Number(simpleBedsAvailable) || 0);
  const numBedOcc = Math.max(0, Number(simpleBedsOccupied) || 0);

  const numAdmLastIcu = Math.max(0, Number(admissionsIcu30Min) || 0);
  const numAdmLastVent = Math.max(0, Number(admissionsVentilator30Min) || 0);
  const numAdmLastBed = Math.max(0, Number(admissionsSimpleBeds30Min) || 0);

  const numDisLastIcu = Math.max(0, Number(dischargesIcu30Min) || 0);
  const numDisLastVent = Math.max(0, Number(dischargesVentilator30Min) || 0);
  const numDisLastBed = Math.max(0, Number(dischargesSimpleBeds30Min) || 0);

  const numEm30 = Math.max(0, Number(emergencyArrivals30Min) || 0);

  // Auto-calculated live metrics preview
  const liveMetrics = calculateTelemetryMetrics({
    icu_available: numIcuAvail,
    icu_occupied: numIcuOcc,
    ventilator_available: numVentAvail,
    ventilator_occupied: numVentOcc,
    simple_beds_available: numBedAvail,
    simple_beds_occupied: numBedOcc,

    admissions_icu_30min: numAdmLastIcu,
    admissions_ventilator_30min: numAdmLastVent,
    admissions_simple_beds_30min: numAdmLastBed,

    discharges_icu_30min: numDisLastIcu,
    discharges_ventilator_30min: numDisLastVent,
    discharges_simple_beds_30min: numDisLastBed,

    emergency_arrivals_30min: numEm30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const rawInputs = {
      icu_available: numIcuAvail,
      icu_occupied: numIcuOcc,
      ventilator_available: numVentAvail,
      ventilator_occupied: numVentOcc,
      simple_beds_available: numBedAvail,
      simple_beds_occupied: numBedOcc,

      admissions_icu_30min: numAdmLastIcu,
      admissions_ventilator_30min: numAdmLastVent,
      admissions_simple_beds_30min: numAdmLastBed,

      discharges_icu_30min: numDisLastIcu,
      discharges_ventilator_30min: numDisLastVent,
      discharges_simple_beds_30min: numDisLastBed,

      emergency_arrivals_30min: numEm30,
    };

    const validation = validateTelemetryInputs(rawInputs);
    if (!validation.isValid) {
      setErrorMessage(`❌ Validation Error: ${validation.error}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        hospital_id: hospital.id,
        date_time: currentSlotKey,
        name: hospital.name,
        hospital_name: hospital.name,
        address: hospital.address,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        ...rawInputs,
      };

      const success = await onSaveFullTelemetry(payload);
      if (success) {
        setSuccessMessage(`✅ 30-Min Telemetry row [${currentSlotKey}] saved and archived to Firestore!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage('Failed to save telemetry record. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving 30-min telemetry record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.35rem',
    display: 'block',
  };

  const calculatedBoxStyle: React.CSSProperties = {
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    border: '1px dashed rgba(37, 99, 235, 0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.85rem',
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div
      className="resq-card"
      style={{
        padding: '2rem 1.75rem',
        border: '1.5px solid rgba(255, 255, 255, 0.9)',
        boxShadow: 'var(--shadow-3d)',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
            <span>Hospital Resource Telemetry</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            30-Minute Interval Real-Time Telemetry & Historical Log System
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Clock size={14} />
            <span>Active Slot: {currentSlotKey}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Facility ID: <strong>{hospital.id}</strong>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#DC2626',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SECTION 1: ICU BEDS */}
        <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔴 ICU Capacity & 30-Min Flow
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>ICU Available</label>
              <input
                type="number"
                min="0"
                required
                value={icuAvailable}
                onChange={(e) => setIcuAvailable(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>ICU Occupied</label>
              <input
                type="number"
                min="0"
                required
                value={icuOccupied}
                onChange={(e) => setIcuOccupied(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Admissions ICU (30m)</label>
              <input
                type="number"
                min="0"
                required
                value={admissionsIcu30Min}
                onChange={(e) => setAdmissionsIcu30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Discharges ICU (30m)</label>
              <input
                type="number"
                min="0"
                required
                value={dischargesIcu30Min}
                onChange={(e) => setDischargesIcu30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Auto-Calculated System Outputs for ICU */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={calculatedBoxStyle}>
              <span>ICU Total Capacity:</span>
              <span>{liveMetrics.icu_total} Beds</span>
            </div>
            <div style={calculatedBoxStyle}>
              <span>ICU Occupancy Rate:</span>
              <span>{liveMetrics.icu_occupancy_rate}%</span>
            </div>
            <div style={calculatedBoxStyle}>
              <span>ICU Available After 30m:</span>
              <span>{liveMetrics.icu_available_after_30min} Beds</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: VENTILATOR UNITS */}
        <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#D97706', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🟡 Ventilator Capacity & 30-Min Flow
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Ventilator Available</label>
              <input
                type="number"
                min="0"
                required
                value={ventilatorAvailable}
                onChange={(e) => setVentilatorAvailable(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ventilator Occupied</label>
              <input
                type="number"
                min="0"
                required
                value={ventilatorOccupied}
                onChange={(e) => setVentilatorOccupied(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Admissions Vent (30m)</label>
              <input
                type="number"
                min="0"
                required
                value={admissionsVentilator30Min}
                onChange={(e) => setAdmissionsVentilator30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Discharges Vent (30m)</label>
              <input
                type="number"
                min="0"
                required
                value={dischargesVentilator30Min}
                onChange={(e) => setDischargesVentilator30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Auto-Calculated System Outputs for Ventilator */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={calculatedBoxStyle}>
              <span>Ventilator Total:</span>
              <span>{liveMetrics.ventilator_total} Units</span>
            </div>
            <div style={calculatedBoxStyle}>
              <span>Ventilator Occupancy Rate:</span>
              <span>{liveMetrics.ventilator_occupancy_rate}%</span>
            </div>
            <div style={calculatedBoxStyle}>
              <span>Vent Available After 30m:</span>
              <span>{liveMetrics.ventilator_available_after_30min} Units</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: SIMPLE BEDS (GENERAL BEDS) */}
        <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🟢 Simple Beds (General Ward) & 30-Min Flow
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Simple Beds Available</label>
              <input
                type="number"
                min="0"
                required
                value={simpleBedsAvailable}
                onChange={(e) => setSimpleBedsAvailable(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Simple Beds Occupied</label>
              <input
                type="number"
                min="0"
                required
                value={simpleBedsOccupied}
                onChange={(e) => setSimpleBedsOccupied(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Admissions Beds (30m)</label>
              <input
                type="number"
                min="0"
                required
                value={admissionsSimpleBeds30Min}
                onChange={(e) => setAdmissionsSimpleBeds30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Discharges Beds (30m)</label>
              <input
                type="number"
                min="0"
                required
                value={dischargesSimpleBeds30Min}
                onChange={(e) => setDischargesSimpleBeds30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Auto-Calculated System Outputs for Simple Beds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={calculatedBoxStyle}>
              <span>Simple Beds Total:</span>
              <span>{liveMetrics.simple_beds_total} Beds</span>
            </div>
            <div style={calculatedBoxStyle}>
              <span>Simple Beds Occupancy Rate:</span>
              <span>{liveMetrics.simple_beds_occupancy_rate}%</span>
            </div>
            <div style={calculatedBoxStyle}>
              <span>Simple Beds Avail. After 30m:</span>
              <span>{liveMetrics.simple_beds_available_after_30min} Beds</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: EMERGENCY ARRIVALS (30M) */}
        <div style={{ backgroundColor: 'rgba(254, 242, 242, 0.8)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#DC2626', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚨 Emergency Arrivals (Last 30 Min)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tracked as a separate feature for future machine learning prediction models (not directly subtracted from availability).
              </p>
            </div>
            <div style={{ width: '160px' }}>
              <label style={labelStyle}>Emergency Arrivals</label>
              <input
                type="number"
                min="0"
                required
                value={emergencyArrivals30Min}
                onChange={(e) => setEmergencyArrivals30Min(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              gap: '8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {isSubmitting ? (
              <span>Saving 30-Min Telemetry...</span>
            ) : (
              <>
                <Save size={18} />
                <span>Save 30-Min Telemetry Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
