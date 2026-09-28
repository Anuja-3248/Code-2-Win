import React from 'react';
import {
  X,
  MapPin,
  Navigation,
  Phone,
  Activity,
  Bed,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import type { Hospital, ResourceType } from '../types/hospital';
import { StatusBadge } from './StatusBadge';
import { LivePredictionIndicator } from './LivePredictionIndicator';

interface HospitalDetailModalProps {
  hospital: Hospital | null;
  requestedResource?: ResourceType;
  onClose: () => void;
  onNavigate: (hospital: Hospital) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  requestedResource = 'ICU',
  onClose,
  onNavigate,
}) => {
  if (!hospital) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        className="resq-card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 25px 60px -10px rgba(5, 14, 29, 0.4), inset 0 1.5px 1px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>{hospital.name}</h2>
              <StatusBadge status={hospital.status} size="sm" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={16} style={{ color: 'var(--royal-600)', flexShrink: 0 }} />
              <span>{hospital.address}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(240, 249, 255, 0.8)',
              border: '1px solid rgba(186, 230, 253, 0.8)',
              color: 'var(--text-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(10, 25, 47, 0.05)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Distance & ETA Highlights Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ backgroundColor: 'rgba(239, 246, 255, 0.9)', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(147, 197, 253, 0.8)', boxShadow: 'inset 0 1px 1px #ffffff' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--royal-700)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Distance</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--royal-800)' }}>
              {hospital.distanceKm ? `${hospital.distanceKm} km` : '3.2 km'}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(240, 253, 244, 0.9)', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(167, 243, 208, 0.8)', boxShadow: 'inset 0 1px 1px #ffffff' }}>
            <span style={{ fontSize: '0.725rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ambulance ETA</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857' }}>
              {hospital.etaMinutes ? `${hospital.etaMinutes} min` : '9 min'}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.9)', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(203, 213, 225, 0.8)', boxShadow: 'inset 0 1px 1px #ffffff' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Occupancy Rate</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: hospital.occupancyRate > 80 ? 'var(--warning)' : 'var(--text-navy)' }}>
              {hospital.occupancyRate}%
            </div>
          </div>
        </div>

        {/* Primary Target Resource Live Comparison */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} style={{ color: 'var(--primary)' }} />
              Target Resource Availability ({requestedResource})
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Data last updated: {hospital.lastUpdated}
            </span>
          </div>

          <LivePredictionIndicator
            resourceType={requestedResource}
            currentAvailable={
              requestedResource === 'ICU'
                ? hospital.icuAvailable
                : requestedResource === 'Ventilator'
                ? hospital.ventilatorsAvailable
                : hospital.generalBedsAvailable
            }
            predictedAvailable={
              requestedResource === 'ICU'
                ? hospital.predictedIcuAvailable30Min
                : requestedResource === 'Ventilator'
                ? hospital.predictedVentilatorsAvailable30Min || Math.max(0, hospital.ventilatorsAvailable - 1)
                : hospital.predictedGeneralBedsAvailable30Min || Math.max(0, hospital.generalBedsAvailable - 2)
            }
          />
        </div>

        {/* Complete Resource Capacity Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Full Emergency Department Capacity
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {/* ICU Breakdown */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                <Activity size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>ICU Beds</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Available:</span>
                <strong style={{ color: '#1e7e48' }}>{hospital.icuAvailable} of {hospital.icuTotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>In 30 min:</span>
                <span>~{hospital.predictedIcuAvailable30Min} beds</span>
              </div>
            </div>

            {/* Ventilator Breakdown */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                <Wind size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Ventilators</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Available:</span>
                <strong style={{ color: '#1e7e48' }}>{hospital.ventilatorsAvailable} of {hospital.ventilatorsTotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>In 30 min:</span>
                <span>~{hospital.predictedVentilatorsAvailable30Min || Math.max(0, hospital.ventilatorsAvailable - 1)} units</span>
              </div>
            </div>

            {/* General Bed Breakdown */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                <Bed size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>General Beds</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Available:</span>
                <strong style={{ color: '#1e7e48' }}>{hospital.generalBedsAvailable} of {hospital.generalBedsTotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>In 30 min:</span>
                <span>~{hospital.predictedGeneralBedsAvailable30Min || Math.max(0, hospital.generalBedsAvailable - 2)} beds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact & 30-min Flow Dynamics */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={15} style={{ color: 'var(--emergency)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                ER Direct Hotline:
              </span>
              <a href={`tel:${hospital.emergencyContact}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {hospital.emergencyContact}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              ResQLink Verified Emergency Node
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>Admissions (30m): <strong>{hospital.admissionsLast30Min}</strong></span>
            <span>Discharges (30m): <strong>{hospital.dischargesLast30Min}</strong></span>
            <span>Ambulances In-Route: <strong>{hospital.emergencyArrivalsLast30Min}</strong></span>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
          >
            Close Details
          </button>

          <button
            type="button"
            onClick={() => onNavigate(hospital)}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <Navigation size={16} />
            Navigate to Hospital
          </button>
        </div>
      </div>
    </div>
  );
};
