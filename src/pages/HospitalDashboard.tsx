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
} from 'lucide-react';
import type { Hospital, ResourceType, HospitalActivityLog } from '../types/hospital';
import { ApiService } from '../services/apiService';
import { StatusBadge } from '../components/StatusBadge';
import { ResourceUpdateForm } from '../components/ResourceUpdateForm';
import { Link } from 'react-router-dom';

interface HospitalDashboardProps {
  hospitalId?: string;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitalId = 'hosp-001',
}) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [logs, setLogs] = useState<HospitalActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const data = await ApiService.fetchHospitalById(hospitalId);
      setHospital(data);
      const activityLogs = await ApiService.getActivityLogs();
      setLogs(activityLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleHospitalUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
    window.addEventListener('resqlink-logs-updated', handleHospitalUpdate);

    return () => {
      window.removeEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
      window.removeEventListener('resqlink-logs-updated', handleHospitalUpdate);
    };
  }, [hospitalId]);

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

  if (isLoading || !hospital) {
    return (
      <div className="container-responsive" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <RefreshCw size={28} className="status-dot-pulse" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading hospital resource telemetry...</p>
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

          {/* Facility & Last Updated Badge */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {hospital.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                Last updated: <strong>{hospital.lastUpdated}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="btn btn-outline btn-sm"
              title="Refresh telemetry"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
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
              currentIcu={hospital.icuAvailable}
              currentVentilators={hospital.ventilatorsAvailable}
              currentGeneral={hospital.generalBedsAvailable}
              onUpdate={handleUpdateAvailability}
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
