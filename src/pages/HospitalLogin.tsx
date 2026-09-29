import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Ambulance, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ApiService } from '../services/apiService';

import { INITIAL_MOCK_HOSPITALS } from '../data/mockHospitals';

interface HospitalLoginProps {
  onLoginSuccess: (hospitalId: string, hospitalName: string) => void;
}

export const HospitalLogin: React.FC<HospitalLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@h001.resqlink.org');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [hospitalIdPreset, setHospitalIdPreset] = useState('H001');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupHospitalName, setSignupHospitalName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await ApiService.loginHospital(loginEmail, loginPassword);
      if (res.success && res.hospitalId) {
        onLoginSuccess(res.hospitalId, res.hospitalName);
        navigate('/hospital/dashboard');
      } else {
        const found = INITIAL_MOCK_HOSPITALS.find(h => h.id === hospitalIdPreset);
        const selectedName = found ? found.name : 'Dr. D. Y. Patil Hospital';
        onLoginSuccess(hospitalIdPreset, selectedName);
        navigate('/hospital/dashboard');
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Login failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await ApiService.signupHospital(signupEmail, signupPassword, signupHospitalName);
      if (res.success) {
        setStatusMessage({
          text: `✅ Account created! Hospital ID: ${res.hospitalId}. Entering dashboard...`,
          type: 'success',
        });
        setSignupEmail('');
        setSignupPassword('');
        setSignupHospitalName('');

        setTimeout(() => {
          onLoginSuccess(res.hospitalId, res.hospitalName);
          navigate('/hospital/dashboard');
        }, 800);
      } else {
        setStatusMessage({ text: res.error || 'Signup failed', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Signup failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectHospitalPreset = (id: string, em: string) => {
    setHospitalIdPreset(id);
    setLoginEmail(em);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '4rem 0 5.5rem' }}>
      <div className="container-narrow" style={{ maxWidth: 500 }}>
        {/* Main Authentication Card - 3D Glass Coated */}
        <div
          className="resq-card reveal-scale"
          style={{
            padding: '2.75rem 2.25rem',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: 'var(--shadow-3d)',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Logo size="lg" clickable={false} />
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.4rem' }}>
              Hospital Portal
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Update your hospital's live clinical resource telemetry
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(224, 242, 254, 0.6)',
              border: '1px solid rgba(186, 230, 253, 0.8)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStatusMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? 'var(--royal-700)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(10, 25, 47, 0.08), inset 0 1px 1px #ffffff' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStatusMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === 'signup' ? '#FFFFFF' : 'transparent',
                color: mode === 'signup' ? 'var(--royal-700)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 2px 8px rgba(10, 25, 47, 0.08), inset 0 1px 1px #ffffff' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor:
                  statusMessage.type === 'success'
                    ? '#d4edda'
                    : statusMessage.type === 'error'
                    ? '#f8d7da'
                    : '#d1ecf1',
                color:
                  statusMessage.type === 'success'
                    ? '#155724'
                    : statusMessage.type === 'error'
                    ? '#721c24'
                    : '#0c5460',
                border: `1px solid ${
                  statusMessage.type === 'success'
                    ? '#c3e6cb'
                    : statusMessage.type === 'error'
                    ? '#f5c6cb'
                    : '#bee5eb'
                }`,
              }}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Facility Select Preset */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor="hospital-id-select"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  Select Facility Preset
                </label>
                <select
                  id="hospital-id-select"
                  value={hospitalIdPreset}
                  onChange={(e) => {
                    const id = e.target.value;
                    setHospitalIdPreset(id);
                    setLoginEmail(`admin@${id.toLowerCase()}.resqlink.org`);
                  }}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'var(--text-main)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                >
                  {INITIAL_MOCK_HOSPITALS.map((h) => (
                    <option key={h.id} value={h.id}>
                      [{h.id}] {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor="hospital-email-input"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  Authorized Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="hospital-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@hospital.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Hospital Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor="signup-name-input"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  Hospital Facility Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={signupHospitalName}
                    onChange={(e) => setSignupHospitalName(e.target.value)}
                    placeholder="e.g. Metro Care Emergency Center"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text-main)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <Building
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

              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor="signup-email-input"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  Authorized Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@hospital.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                  htmlFor="signup-password-input"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password-input"
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Choose a secure password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

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
              Demo Facility Quick Select:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => selectHospitalPreset('H001', 'admin@h001.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                H001 - D.Y. Patil
              </button>
              <button
                type="button"
                onClick={() => selectHospitalPreset('H002', 'admin@h002.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                H002 - JeevanJyoti
              </button>
              <button
                type="button"
                onClick={() => selectHospitalPreset('H003', 'admin@h003.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                H003 - Metro
              </button>
              <button
                type="button"
                onClick={() => selectHospitalPreset('H018', 'admin@h018.resqlink.org')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                H018 - MIMER
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
