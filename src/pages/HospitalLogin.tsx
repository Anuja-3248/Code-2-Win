import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Ambulance, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ApiService } from '../services/apiService';
import type { Hospital } from '../types/hospital';

interface HospitalLoginProps {
  onLoginSuccess: (hospitalId: string, hospitalName: string) => void;
}

export const HospitalLogin: React.FC<HospitalLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Registered hospitals fetched live from Firestore
  const [liveHospitals, setLiveHospitals] = useState<Hospital[]>([]);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [hospitalIdPreset, setHospitalIdPreset] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupHospitalName, setSignupHospitalName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    async function loadLiveHospitals() {
      try {
        const list = await ApiService.fetchNearbyHospitals(18.5204, 73.8567, 1000);
        setLiveHospitals(list);
        if (list.length > 0) {
          setHospitalIdPreset(list[0].id);
          setLoginEmail(`admin@${list[0].id.toLowerCase()}.resqlink.org`);
        }
      } catch (err) {
        console.warn('Notice loading live hospitals:', err);
      }
    }
    loadLiveHospitals();
  }, []);

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
        setStatusMessage({ text: res.error || 'Invalid credentials or account does not exist.', type: 'error' });
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
          text: `✅ Account created! Serial Facility ID: ${res.hospitalId}. Entering hospital dashboard...`,
          type: 'success',
        });
        setSignupEmail('');
        setSignupPassword('');
        setSignupHospitalName('');

        setTimeout(() => {
          onLoginSuccess(res.hospitalId, res.hospitalName);
          navigate('/hospital/dashboard');
        }, 1000);
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
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Logo size="lg" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Hospital Control Portal
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {mode === 'login'
                ? 'Sign in to update critical care telemetry mesh'
                : 'Register your hospital facility with sequential serial ID'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: 'rgba(235, 238, 245, 0.8)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
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
                padding: '0.6rem',
                border: 'none',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'login' ? 700 : 500,
                fontSize: '0.875rem',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
                padding: '0.6rem',
                border: 'none',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                backgroundColor: mode === 'signup' ? '#FFFFFF' : 'transparent',
                color: mode === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'signup' ? 700 : 500,
                fontSize: '0.875rem',
                boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor:
                  statusMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : statusMessage.type === 'error'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(37, 99, 235, 0.1)',
                color:
                  statusMessage.type === 'success'
                    ? '#059669'
                    : statusMessage.type === 'error'
                    ? '#DC2626'
                    : 'var(--primary)',
                border: `1px solid ${
                  statusMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : statusMessage.type === 'error'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(37, 99, 235, 0.2)'
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

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Registered Facility Preset Select (If available in Firestore) */}
              {liveHospitals.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label
                    htmlFor="hospital-id-select"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    Select Registered Facility
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
                    {liveHospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        [{h.id}] {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    htmlFor="hospital-password-input"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="hospital-password-input"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  marginTop: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  gap: '0.5rem',
                }}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Hospital Name Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor="signup-name-input"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  Hospital / Facility Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={signupHospitalName}
                    onChange={(e) => setSignupHospitalName(e.target.value)}
                    placeholder="e.g. Metro Multispeciality Hospital"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <Building
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
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
                  Authorized Email Address
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
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
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
                  Choose Password (min 6 chars)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-color)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  marginTop: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  gap: '0.5rem',
                }}
              >
                {isLoading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Hospital Account</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Select for Registered Hospitals */}
          {liveHospitals.length > 0 && mode === 'login' && (
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
                Registered Facilities in Database:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {liveHospitals.slice(0, 6).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => selectHospitalPreset(h.id, `admin@${h.id.toLowerCase()}.resqlink.org`)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {h.id} - {h.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
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
