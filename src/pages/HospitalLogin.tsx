import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Ambulance } from 'lucide-react';
import { Logo } from '../components/Logo';

interface HospitalLoginProps {
  onLoginSuccess: (hospitalId: string, hospitalName: string) => void;
}

export const HospitalLogin: React.FC<HospitalLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [hospitalId, setHospitalId] = useState('hosp-001'); // Ruby Care Hospital
  const [email, setEmail] = useState('admin@rubycare.resqlink.org');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      let selectedName = 'Ruby Care Hospital';
      if (hospitalId === 'hosp-002') selectedName = 'CityCare Hospital';
      if (hospitalId === 'hosp-003') selectedName = 'Sahyadri Emergency Center';
      if (hospitalId === 'hosp-004') selectedName = 'Jehangir Memorial Hospital';

      onLoginSuccess(hospitalId, selectedName);
      navigate('/hospital/dashboard');
    }, 600);
  };

  const selectHospitalPreset = (id: string, em: string) => {
    setHospitalId(id);
    setEmail(em);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container-narrow" style={{ maxWidth: 480 }}>
        {/* Card */}
        <div
          className="resq-card"
          style={{
            padding: '2.5rem 2rem',
            border: '1.5px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Logo size="lg" clickable={false} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Hospital Portal
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Update your hospital's current emergency resources.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Hospital Node Selector / ID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="hospital-id-select"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
              >
                Select Hospital Facility
              </label>
              <select
                id="hospital-id-select"
                value={hospitalId}
                onChange={(e) => {
                  setHospitalId(e.target.value);
                  if (e.target.value === 'hosp-001') setEmail('admin@rubycare.resqlink.org');
                  if (e.target.value === 'hosp-002') setEmail('admin@citycare.resqlink.org');
                  if (e.target.value === 'hosp-003') setEmail('admin@sahyadri.resqlink.org');
                }}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              >
                <option value="hosp-001">Ruby Care Hospital (Sangamvadi, Pune)</option>
                <option value="hosp-002">CityCare Hospital (Station Road, Pune)</option>
                <option value="hosp-003">Sahyadri Emergency Center (Karve Road, Pune)</option>
                <option value="hosp-004">Jehangir Memorial Hospital (Sassoon Road, Pune)</option>
              </select>
            </div>

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="hospital-email-input"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
              >
                Hospital ID / Authorized Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="hospital-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="hospital-password-input"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="hospital-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Prototype Quick Selector Helpers */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Prototype Demo Facility Switcher:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => selectHospitalPreset('hosp-001', 'admin@rubycare.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Ruby Care
              </button>
              <button
                type="button"
                onClick={() => selectHospitalPreset('hosp-002', 'admin@citycare.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                CityCare
              </button>
              <button
                type="button"
                onClick={() => selectHospitalPreset('hosp-003', 'admin@sahyadri.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Sahyadri
              </button>
            </div>
          </div>
        </div>

        {/* Return to Ambulance Portal Shortcut */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/ambulance"
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Ambulance size={15} />
            Are you an ambulance crew? Go to Ambulance Emergency Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
