import React, { useState, useEffect } from 'react';
import { Ambulance, Shield, Edit3, CheckCircle2, Truck } from 'lucide-react';
import { getStoredAmbulanceProfile, registerAmbulance, type RegisterAmbulanceInput } from '../services/ambulanceService';
import type { AmbulanceProfile } from '../types/ambulance';

export const AmbulanceUnitHeader: React.FC = () => {
  const [profile, setProfile] = useState<AmbulanceProfile | null>(() => getStoredAmbulanceProfile());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState<RegisterAmbulanceInput>(() => {
    const active = getStoredAmbulanceProfile();
    if (active) {
      return {
        email: active.email,
        password: '',
        vehicleNumber: active.vehicleNumber,
        driverName: active.driverName,
        driverPhone: active.driverPhone,
        ambulanceType: active.ambulanceType,
        baseStation: active.baseStation,
      };
    }
    return {
      email: '',
      password: '',
      vehicleNumber: 'MH12 AB 1080',
      driverName: 'Ramesh Patil',
      driverPhone: '+91 98220 12345',
      ambulanceType: 'ALS',
      baseStation: 'Pune EMS Center, Shivajinagar',
    };
  });

  useEffect(() => {
    const active = getStoredAmbulanceProfile();
    if (!active) {
      // Create default persistent unit so first-time ambulance dispatch works immediately
      registerAmbulance({
        email: 'amb108@pune-ems.gov.in',
        vehicleNumber: 'MH12 AB 1080',
        driverName: 'Suresh More',
        driverPhone: '+91 98220 12345',
        ambulanceType: 'ALS',
        baseStation: 'Pune EMS Center',
      }).then((newProf) => {
        setProfile(newProf);
      });
    }

    const handleUpdate = (e: any) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('resqlink_ambulance_updated', handleUpdate);
    return () => window.removeEventListener('resqlink_ambulance_updated', handleUpdate);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const registered = await registerAmbulance(formData);
    setProfile(registered);
    setIsModalOpen(false);
  };

  if (!profile) return null;

  return (
    <>
      {/* Unit Identity Banner - 3D Deep Navy Glass Coated */}
      <div
        className="resq-card"
        style={{
          padding: '1rem 1.4rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          backgroundColor: 'rgba(13, 27, 49, 0.72)',
          border: '1.5px solid rgba(56, 189, 248, 0.25)',
          boxShadow: 'var(--shadow-3d)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'var(--royal-gradient-3d)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          >
            <Ambulance size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '1.05rem', color: '#FFFFFF', letterSpacing: '0.2px' }}>
                Unit ID: {profile.ambulanceId}
              </strong>
              <span className="badge badge-teal" style={{ fontSize: '0.725rem' }}>
                <CheckCircle2 size={12} /> Unit Active
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '2px' }}>
              <Truck size={13} style={{ display: 'inline', marginRight: '4px', color: '#38BDF8' }} />
              <strong style={{ color: '#BAE6FD' }}>{profile.vehicleNumber}</strong> ({profile.ambulanceType} Unit) • Driver: {profile.driverName} ({profile.driverPhone})
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-sm btn-secondary"
          style={{
            fontSize: '0.8125rem',
            padding: '0.4rem 0.85rem',
          }}
        >
          <Edit3 size={14} /> Update Unit Details
        </button>
      </div>

      {/* Registration / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 10, 20, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="resq-card"
            style={{
              width: '100%',
              maxWidth: 520,
              padding: '2rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(10, 25, 47, 0.95)',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Shield size={20} color="#38BDF8" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Ambulance Unit Registration & Identity
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Your unit ID is permanently authenticated. This information is automatically transmitted to emergency triage staff during Pre-Alerts.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#BAE6FD', display: 'block', marginBottom: '4px' }}>
                    Vehicle Reg. Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH12 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(7, 15, 30, 0.8)', color: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#BAE6FD', display: 'block', marginBottom: '4px' }}>
                    Ambulance Type
                  </label>
                  <select
                    value={formData.ambulanceType}
                    onChange={(e) => setFormData({ ...formData, ambulanceType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(7, 15, 30, 0.8)', color: '#FFFFFF' }}
                  >
                    <option value="ALS">ALS (Advanced Life Support)</option>
                    <option value="BLS">BLS (Basic Life Support)</option>
                    <option value="Neonatal">Neonatal Intensive Care Unit</option>
                    <option value="Patient Transport">Patient Transport Unit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#BAE6FD', display: 'block', marginBottom: '4px' }}>
                    Paramedic / Driver Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(7, 15, 30, 0.8)', color: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#BAE6FD', display: 'block', marginBottom: '4px' }}>
                    Emergency Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98220 12345"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(7, 15, 30, 0.8)', color: '#FFFFFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#BAE6FD', display: 'block', marginBottom: '4px' }}>
                  Ambulance Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="amb108@pune-ems.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(7, 15, 30, 0.8)', color: '#FFFFFF' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#BAE6FD', display: 'block', marginBottom: '4px' }}>
                  Base Station / Operating Hub
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune Central Depot"
                  value={formData.baseStation || ''}
                  onChange={(e) => setFormData({ ...formData, baseStation: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(7, 15, 30, 0.8)', color: '#FFFFFF' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Save & Keep Logged In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
