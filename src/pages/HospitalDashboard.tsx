import React, { useEffect, useState } from 'react';
import {
  Activity,
  Wind,
  Bed,
  TrendingUp,
  Clock,
  RefreshCw,
  Sparkles,
  Ambulance,
  Radio,
  Check,
  CheckCircle2,
} from 'lucide-react';
import type { Hospital, ResourceType, HospitalActivityLog } from '../types/hospital';
import { ApiService } from '../services/apiService';
import { StatusBadge } from '../components/StatusBadge';
import { ResourceUpdateForm } from '../components/ResourceUpdateForm';
import { subscribeHospitalPreAlerts, updatePreAlertStatus } from '../services/ambulanceService';
import type { PreAlertPayload } from '../types/ambulance';
import { Link } from 'react-router-dom';

interface HospitalDashboardProps {
  hospitalId?: string;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitalId = 'hosp-001',
}) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [logs, setLogs] = useState<HospitalActivityLog[]>([]);
  const [preAlerts, setPreAlerts] = useState<PreAlertPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      let data = await ApiService.fetchHospitalById(hospitalId);
      if (!data) {
        ApiService.resetDemoData();
        data = await ApiService.fetchHospitalById(hospitalId);
      }
      setHospital(data);
      const activityLogs = await ApiService.getActivityLogs();
      setLogs(activityLogs);
    } catch (e) {
      console.error('Error fetching dashboard telemetry:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to real-time incoming ambulance pre-alerts
    const unsubscribeAlerts = subscribeHospitalPreAlerts(hospitalId, (alerts) => {
      setPreAlerts(alerts);
    });

    const handleHospitalUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
    window.addEventListener('resqlink-logs-updated', handleHospitalUpdate);

    return () => {
      unsubscribeAlerts();
      window.removeEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
      window.removeEventListener('resqlink-logs-updated', handleHospitalUpdate);
    };
  }, [hospitalId]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    await updatePreAlertStatus(alertId, 'ACKNOWLEDGED');
  };

  const handleMarkArrived = async (alertId: string) => {
    await updatePreAlertStatus(alertId, 'ARRIVED');
  };

  const handleUpdateAvailability = async (resourceType: ResourceType, count: number): Promise<boolean> => {
    if (!hospital) return false;
    const res = await ApiService.updateAvailability(hospital.id, {
      resourceType,
      availableCount: count,
      updatedBy: 'Dr. ER Chief Operations',
    });
    if (res.success && res.hospital) {
      setHospital(res.hospital);
      const newLogs = await ApiService.getActivityLogs();
      setLogs(newLogs);
      return true;
    }
    return false;
  };

  const handleSaveFullTelemetry = async (payload: any): Promise<boolean> => {
    if (!hospital) return false;
    const res = await ApiService.saveFullHospitalTelemetry(hospital.id, payload);
    if (res.success && res.hospital) {
      setHospital(res.hospital);
      const newLogs = await ApiService.getActivityLogs();
      setLogs(newLogs);
      return true;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="container-responsive" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <RefreshCw size={28} className="status-dot-pulse" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading hospital resource telemetry...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container-responsive" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Hospital Telemetry Unavailable
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Unable to locate live resource data for facility ID: {hospitalId}.
        </p>
        <button
          type="button"
          onClick={() => {
            ApiService.resetDemoData();
            fetchDashboardData();
          }}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Reset Telemetry & Reload
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-responsive">
        {/* Top Operational Status Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800 }}>
                Hospital Resource Dashboard
              </h1>
              <StatusBadge status={hospital.status} size="md" />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Keep your emergency resource availability up to date for dispatching ambulances.
            </p>
          </div>

          {/* Facility & Last Updated Badge - 3D Glass */}
          <div
            className="resq-card"
            style={{
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              border: '1.5px solid rgba(186, 230, 253, 0.8)',
              boxShadow: 'var(--shadow-3d)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '0.985rem' }}>
                {hospital.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={13} style={{ color: 'var(--royal-600)' }} />
                Last synchronized: <strong>{hospital.lastUpdated}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="btn btn-secondary btn-sm"
              title="Refresh telemetry"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Live Incoming Ambulance Pre-Alerts Radar - 3D Glass Panel */}
        <div
          className="resq-card"
          style={{
            backgroundColor: preAlerts.some((a) => a.status === 'EN_ROUTE') ? 'rgba(254, 242, 242, 0.9)' : 'rgba(255, 255, 255, 0.85)',
            border: `1.5px solid ${preAlerts.some((a) => a.status === 'EN_ROUTE') ? 'rgba(252, 165, 165, 0.8)' : 'rgba(186, 230, 253, 0.8)'}`,
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: preAlerts.some((a) => a.status === 'EN_ROUTE') ? '0 12px 28px rgba(225, 29, 72, 0.15)' : 'var(--shadow-3d)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: preAlerts.some((a) => a.status === 'EN_ROUTE') ? 'var(--emergency)' : 'var(--royal-600)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(29, 78, 216, 0.3)',
                }}
              >
                <Radio size={18} className="status-dot-pulse" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-navy)' }}>
                  Live Inbound Ambulance Pre-Alerts
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Real-time ER telemetry communicated by approaching ambulances in transit.
                </p>
              </div>
            </div>

            <span
              className={preAlerts.length > 0 ? 'badge badge-emergency' : 'badge badge-teal'}
              style={{ fontSize: '0.8rem' }}
            >
              {preAlerts.filter((a) => a.status !== 'ARRIVED').length} Active En Route
            </span>
          </div>

          {preAlerts.length === 0 ? (
            <div style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(240, 249, 255, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(147, 197, 253, 0.8)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>ER Triage Radar Clear — No emergency ambulances currently routed to this facility.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {preAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${alert.status === 'EN_ROUTE' ? '#f87171' : '#cbd5e1'}`,
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: alert.status === 'EN_ROUTE' ? '#fee2e2' : '#f1f5f9',
                        color: alert.status === 'EN_ROUTE' ? '#dc2626' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Ambulance size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                          Unit: {alert.ambulanceId} ({alert.vehicleNumber})
                        </strong>
                        <span
                          style={{
                            backgroundColor: alert.status === 'EN_ROUTE' ? '#fef2f2' : alert.status === 'ACKNOWLEDGED' ? '#f0fdf4' : '#f1f5f9',
                            color: alert.status === 'EN_ROUTE' ? '#dc2626' : alert.status === 'ACKNOWLEDGED' ? '#16a34a' : '#64748b',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            border: '1px solid currentColor',
                          }}
                        >
                          {alert.status === 'EN_ROUTE' ? '🚨 EN ROUTE' : alert.status === 'ACKNOWLEDGED' ? '✅ TRIAGE PREPARED' : 'ARRIVED'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                          ETA: ~{Math.round(alert.etaMinutes)} Mins ({alert.distanceKm.toFixed(1)} km)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '3px' }}>
                        Requested: <strong style={{ color: '#1d4ed8' }}>{alert.quantity}x {alert.requiredResource} Bed</strong> • Driver: {alert.driverName} (<a href={`tel:${alert.driverPhone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{alert.driverPhone}</a>)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        Alert ID: {alert.id} • Dispatched at {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {alert.status === 'EN_ROUTE' && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#16a34a', color: '#fff', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                      >
                        <Check size={14} /> Acknowledge & Prep Bay
                      </button>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <button
                        type="button"
                        onClick={() => handleMarkArrived(alert.id)}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                      >
                        Mark Patient Arrived
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4 Clean Resource Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Card 1: ICU Beds */}
          <div className="resq-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>ICU Beds</h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                Telemetry Live
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e7e48', lineHeight: 1 }}>
                {hospital.icuAvailable}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                / {hospital.icuTotal} available
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Predicted in 30 min: <strong>~{hospital.predictedIcuAvailable30Min} beds</strong></span>
            </div>
          </div>

          {/* Card 2: Ventilators */}
          <div className="resq-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wind size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Ventilators</h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                Mechanical
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e7e48', lineHeight: 1 }}>
                {hospital.ventilatorsAvailable}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                / {hospital.ventilatorsTotal} ready
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Predicted in 30 min: <strong>~{hospital.predictedVentilatorsAvailable30Min || Math.max(0, hospital.ventilatorsAvailable - 1)} units</strong></span>
            </div>
          </div>

          {/* Card 3: General Beds */}
          <div className="resq-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bed size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>General Beds</h3>
              </div>
              <span className="badge badge-teal" style={{ fontSize: '0.725rem' }}>
                Ward
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e7e48', lineHeight: 1 }}>
                {hospital.generalBedsAvailable}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                / {hospital.generalBedsTotal} vacant
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Predicted in 30 min: <strong>~{hospital.predictedGeneralBedsAvailable30Min || Math.max(0, hospital.generalBedsAvailable - 2)} beds</strong></span>
            </div>
          </div>

          {/* Card 4: Emergency Capacity & Occupancy */}
          <div className="resq-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Emergency Capacity</h3>
              </div>
              <span className={`badge ${hospital.occupancyRate > 80 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.725rem' }}>
                {hospital.occupancyRate > 80 ? 'High' : 'Optimal'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: hospital.occupancyRate > 80 ? '#b37e17' : 'var(--text-main)', lineHeight: 1 }}>
                {hospital.occupancyRate}%
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                current occupancy
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <span>Recent 30m flow: <strong>+{hospital.admissionsLast30Min} in / -{hospital.dischargesLast30Min} out</strong></span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Update Resource Form & Recent Activity Timeline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Update Resource Section */}
          <div>
            <ResourceUpdateForm
              hospital={hospital}
              onUpdate={handleUpdateAvailability}
              onSaveFullTelemetry={handleSaveFullTelemetry}
            />

            {/* Test Link to Ambulance search */}
            <div
              className="resq-card"
              style={{
                marginTop: '1.25rem',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Ambulance size={20} style={{ color: 'var(--primary)' }} />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>Test Dispatch Allocation</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Verify how emergency ambulances see this hospital in search results.
                  </div>
                </div>
              </div>
              <Link to="/ambulance" className="btn btn-primary btn-sm">
                Open Ambulance Portal
              </Link>
            </div>
          </div>

          {/* Right Column: Recent Activity Timeline */}
          <div className="resq-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Updates & Audits</h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Real-time log
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    position: 'relative',
                  }}
                >
                  {/* Timeline icon dot */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {log.resourceType === 'ICU' ? (
                      <Activity size={13} />
                    ) : log.resourceType === 'Ventilator' ? (
                      <Wind size={13} />
                    ) : (
                      <Bed size={13} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {log.timeFormatted}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {log.details}
                    </p>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Updated by: {log.updatedBy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
