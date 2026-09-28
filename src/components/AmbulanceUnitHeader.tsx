import React, { useState, useEffect } from 'react';
import { Ambulance, Shield, Edit3, CheckCircle2, Truck } from 'lucide-react';
import { getStoredAmbulanceProfile, registerAmbulance, type RegisterAmbulanceInput } from '../services/ambulanceService';
import type { AmbulanceProfile } from '../types/ambulance';

export const AmbulanceUnitHeader: React.FC = () => {
  const [profile, setProfile] = useState<AmbulanceProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState<RegisterAmbulanceInput>({
    email: '',
    password: '',
    vehicleNumber: 'MH12 AB 1080',
    driverName: 'Ramesh Patil',
    driverPhone: '+91 98220 12345',
    ambulanceType: 'ALS',
    baseStation: 'Pune EMS Center, Shivajinagar',
  });

  useEffect(() => {
    let active = getStoredAmbulanceProfile();
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
    } else {
      setProfile(active);
      setFormData({
        email: active.email,
        vehicleNumber: active.vehicleNumber,
        driverName: active.driverName,
        driverPhone: active.driverPhone,
        ambulanceType: active.ambulanceType,
        baseStation: active.baseStation,
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
      {/* Unit Identity Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Ambulance size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '1.05rem', color: '#1e3a8a', letterSpacing: '0.2px' }}>
                Unit ID: {profile.ambulanceId}
              </strong>
              <span
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={12} /> Permanent Login Active
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '2px' }}>
              <Truck size={13} style={{ display: 'inline', marginRight: '4px' }} />
              <strong>{profile.vehicleNumber}</strong> ({profile.ambulanceType} Unit) • Driver: {profile.driverName} ({profile.driverPhone})
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-sm btn-outline"
          style={{
            fontSize: '0.8125rem',
            padding: '0.35rem 0.75rem',
            borderColor: '#93c5fd',
            color: '#1d4ed8',
            backgroundColor: '#ffffff',
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
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
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
              padding: '1.75rem',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Shield size={20} color="#2563eb" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                Ambulance Unit Registration & Identity
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Your unit ID is permanently authenticated. This information is automatically transmitted to emergency triage staff during Pre-Alerts.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Vehicle Reg. Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH12 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Ambulance Type
                  </label>
                  <select
                    value={formData.ambulanceType}
                    onChange={(e) => setFormData({ ...formData, ambulanceType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
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
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Paramedic / Driver Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Emergency Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98220 12345"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Ambulance Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="amb108@pune-ems.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Base Station / Operating Hub
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune Central Depot"
                  value={formData.baseStation || ''}
                  onChange={(e) => setFormData({ ...formData, baseStation: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
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
                  style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb' }}
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
