import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ambulance,
  Hospital,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Activity,
  Radio,
  Zap,
} from 'lucide-react';
import heroParamedicsImg from '../assets/images/hero-paramedics.jpg';
import doctorEmergencyImg from '../assets/images/doctor-emergency.jpg';
import hospitalStaffImg from '../assets/images/hospital-staff.jpg';

export const LandingPage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 5.5rem',
          overflow: 'hidden',
        }}
      >
        <div className="container-responsive">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', position: 'relative', zIndex: 2 }}>
              {/* Clinical Precision Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span
                  className="badge badge-teal"
                  style={{
                    padding: '0.4rem 0.95rem',
                    fontSize: '0.825rem',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                  }}
                >
                  <span className="status-dot status-dot-pulse" style={{ backgroundColor: 'var(--royal-600)' }} />
                  <span style={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Clinical Emergency Network
                  </span>
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.45rem, 4.8vw, 3.4rem)',
                  fontWeight: 800,
                  color: 'var(--text-navy)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.035em',
                }}
              >
                The right care, when every{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #0284C7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  minute matters.
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '540px',
                }}
              >
                ResQLink coordinates emergency response teams with nearby hospital facilities in real time — matching ICU beds, mechanical ventilators, and clinical capacity before transport.
              </p>

              {/* 3D Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.1rem',
                  flexWrap: 'wrap',
                  paddingTop: '0.5rem',
                }}
              >
                <Link
                  to="/ambulance"
                  className="btn btn-primary btn-lg"
                  style={{ gap: '0.65rem' }}
                >
                  <Ambulance size={20} />
                  Find a Hospital
                </Link>

                <Link
                  to="/hospital/login"
                  className="btn btn-secondary btn-lg"
                  style={{ gap: '0.65rem' }}
                >
                  <Hospital size={20} />
                  Hospital Portal
                </Link>
              </div>

              {/* Trust Subtext */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--royal-600)' }} />
                  <span style={{ fontWeight: 600 }}>Zero-Latency GPS Triage</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: 600 }}>Real-Time Capacity Verified</span>
                </div>
              </div>
            </div>

            {/* Right: High-quality 3D Glass Coated Paramedic Frame */}
            <div style={{ position: 'relative' }}>
              {/* Ambient Glow Background behind Glass */}
              <div
                style={{
                  position: 'absolute',
                  inset: -15,
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.12) 50%, transparent 70%)',
                  filter: 'blur(30px)',
                  borderRadius: '30px',
                  zIndex: 0,
                }}
              />

              <div
                className="resq-card glass-hero-float"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'rgba(255, 255, 255, 0.82)',
                  boxShadow: 'var(--shadow-3d-hover)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                }}
              >
                <div
                  style={{
                    overflow: 'hidden',
                    borderRadius: 'calc(var(--radius-xl) - 6px)',
                    aspectRatio: '4 / 3',
                    position: 'relative',
                  }}
                >
                  <img
                    src={heroParamedicsImg}
                    alt="Paramedic emergency response team preparing critical medical care"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  {/* Subtle 3D Glass Specular Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(10, 25, 47, 0.15) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Floating 3D Telemetry Pill */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    right: 24,
                    backgroundColor: 'rgba(10, 25, 47, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1.15rem',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 12px 28px rgba(5, 14, 29, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(37, 99, 235, 0.3)',
                        border: '1px solid #38BDF8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38BDF8',
                      }}
                    >
                      <Activity size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>Live Hospital Sync</div>
                      <div style={{ fontSize: '0.72rem', color: '#BAE6FD' }}>Real-Time Route & Capacity Active</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(5, 150, 105, 0.25)',
                      border: '1px solid rgba(16, 185, 129, 0.6)',
                      color: '#6EE7B7',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
                    99.8% Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section
        id="about"
        style={{
          padding: '5.5rem 0',
          position: 'relative',
        }}
      >
        <div className="container-responsive">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4.5rem',
              alignItems: 'center',
            }}
          >
            {/* Real Doctor Care Photograph with 3D Glass Layering */}
            <div
              className="resq-card"
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(255, 255, 255, 0.82)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: 'var(--shadow-3d)',
              }}
            >
              <div
                style={{
                  borderRadius: 'calc(var(--radius-xl) - 6px)',
                  overflow: 'hidden',
                  aspectRatio: '4 / 3',
                  position: 'relative',
                }}
              >
                <img
                  src={doctorEmergencyImg}
                  alt="Emergency physician reviewing real-time patient bed capacity"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </div>

            {/* Editorial Text Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ display: 'inline-flex' }}>
                <span className="badge badge-teal">
                  <ShieldCheck size={14} />
                  Clinical Reliability & Safety
                </span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.95rem, 3.4vw, 2.45rem)',
                  fontWeight: 800,
                  color: 'var(--text-navy)',
                  lineHeight: 1.25,
                }}
              >
                In an emergency, knowing where to go matters.
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                When transporting a patient in critical condition, emergency teams cannot afford the risk of arriving at a facility with zero available ICU beds or occupied mechanical ventilators.
              </p>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                ResQLink eliminates clinical uncertainty by establishing transparency between ambulances and hospital networks before arrival. Real-time proximity, current bed status, and 30-minute machine learning availability forecasts empower rapid decisions.
              </p>

              {/* 3D Glass Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '1rem',
                  paddingTop: '0.75rem',
                }}
              >
                <div
                  className="resq-card"
                  style={{
                    padding: '1.1rem 1rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(186, 230, 253, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--royal-700)', letterSpacing: '-0.02em' }}>
                    &lt; 10s
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    Match Speed
                  </div>
                </div>

                <div
                  className="resq-card"
                  style={{
                    padding: '1.1rem 1rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(186, 230, 253, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--royal-700)', letterSpacing: '-0.02em' }}>
                    Live
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    Resource Telemetry
                  </div>
                </div>

                <div
                  className="resq-card"
                  style={{
                    padding: '1.1rem 1rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(186, 230, 253, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--royal-700)', letterSpacing: '-0.02em' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    Verified Capacity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section
        id="how-it-works"
        style={{
          padding: '5.5rem 0',
          position: 'relative',
        }}
      >
        <div className="container-responsive">
          {/* Section Header */}
          <div style={{ maxWidth: '680px', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', marginBottom: '0.65rem' }}>
              <span className="badge badge-teal">
                <Zap size={14} />
                Streamlined Protocol
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.95rem, 3.2vw, 2.45rem)',
                fontWeight: 800,
                color: 'var(--text-navy)',
                lineHeight: 1.25,
              }}
            >
              From emergency request to suitable care — in three simple steps.
            </h2>
          </div>

          {/* 3 Numbered Steps with 3D Glass Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              position: 'relative',
            }}
          >
            {/* Step 1 */}
            <div
              className="resq-card resq-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1.5px solid rgba(186, 230, 253, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'var(--royal-gradient-3d)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    boxShadow: '0 6px 16px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  01
                </div>
                <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>Input</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                Tell us what is needed
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Select the required medical resource (ICU, Ventilator, or General Bed), quantity required, and ambulance GPS anchor.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="resq-card resq-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1.5px solid rgba(186, 230, 253, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'var(--royal-gradient-3d)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    boxShadow: '0 6px 16px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  02
                </div>
                <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>Engine Match</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                We check nearby hospitals
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ResQLink dynamically evaluates regional facilities based on real-time distance, transit duration, and live resource availability.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="resq-card resq-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1.5px solid rgba(186, 230, 253, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'var(--royal-gradient-3d)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    boxShadow: '0 6px 16px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  03
                </div>
                <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>Navigation</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                Choose where to go
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Review suitable hospitals, verify live clinical capacity, and navigate directly with zero communication friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT PREVIEW SECTION (3D Glass Mockup) */}
      <section
        style={{
          padding: '5.5rem 0',
          position: 'relative',
        }}
      >
        <div className="container-responsive">
          <div style={{ textAlign: 'center', maxWidth: '660px', margin: '0 auto 3.5rem' }}>
            <div style={{ display: 'inline-flex', marginBottom: '0.65rem' }}>
              <span className="badge badge-teal">
                <Sparkles size={14} />
                Next-Gen Medical Telemetry
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.95rem, 3.2vw, 2.45rem)',
                fontWeight: 800,
                color: 'var(--text-navy)',
                marginBottom: '0.75rem',
              }}
            >
              Know what is available before you arrive.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A high-precision 3D glass interface built for high-stakes decision-making under urgent emergency constraints.
            </p>
          </div>

          {/* 3D Glass Browser Mockup */}
          <div
            className="resq-card"
            style={{
              maxWidth: '880px',
              margin: '0 auto',
              padding: 0,
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-3d-hover)',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              overflow: 'hidden',
            }}
          >
            {/* Mock Window Header */}
            <div
              style={{
                backgroundColor: 'rgba(10, 25, 47, 0.92)',
                backdropFilter: 'blur(16px)',
                padding: '0.9rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span style={{ fontSize: '0.82rem', color: '#BAE6FD', marginLeft: '12px', fontWeight: 600, fontFamily: 'monospace' }}>
                  resqlink.health/ambulance/results
                </span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                3 Suitable Matches
              </span>
            </div>

            {/* Mock Content Body with Frosted Panels */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'rgba(240, 249, 255, 0.5)' }}>
              {/* Request Summary Glass Bar */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(186, 230, 253, 0.8)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <span>Requested: <strong style={{ color: 'var(--royal-700)' }}>2 ICU Beds</strong></span>
                  <span>Anchor: <strong style={{ color: 'var(--text-navy)' }}>Pune Medical Center</strong></span>
                </div>
                <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                  <Radio size={12} className="status-dot-pulse" /> Live Telemetry
                </span>
              </div>

              {/* Hospital Card 1 - Ruby Care (Top Match) */}
              <div
                style={{
                  border: '2px solid rgba(37, 99, 235, 0.7)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12), inset 0 1px 1px rgba(255, 255, 255, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                        Ruby Care Hospital
                      </h4>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        Optimal Match
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <MapPin size={15} style={{ color: 'var(--royal-600)' }} />
                      <span>40 Sassoon Road, Sangamvadi, Pune</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(224, 242, 254, 0.7)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(186, 230, 253, 0.8)' }}>
                    <span style={{ fontWeight: 800, color: 'var(--royal-700)', fontSize: '0.9rem' }}>3.2 km</span>
                    <span style={{ color: 'rgba(147, 197, 253, 0.8)' }}>|</span>
                    <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.9rem' }}>9 min ETA</span>
                  </div>
                </div>

                {/* Live Availability strip */}
                <div
                  style={{
                    backgroundColor: 'rgba(240, 253, 244, 0.85)',
                    border: '1px solid rgba(167, 243, 208, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Current Verified Capacity</span>
                    <div style={{ fontWeight: 800, color: '#047857', fontSize: '1.25rem' }}>4 ICU Beds Available</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Facility Total</span>
                    <div style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '1.15rem' }}>24 Total ICU Units</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOSPITAL SECTION */}
      <section
        id="for-hospitals"
        style={{
          padding: '5.5rem 0',
          position: 'relative',
        }}
      >
        <div className="container-responsive">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ display: 'inline-flex' }}>
                <span className="badge badge-teal">
                  <Hospital size={14} />
                  Hospital Operations Portal
                </span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.95rem, 3.4vw, 2.45rem)',
                  fontWeight: 800,
                  color: 'var(--text-navy)',
                  lineHeight: 1.25,
                }}
              >
                Better information. Better emergency coordination.
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                Hospitals can keep their emergency resource telemetry up to date in seconds through the secure Hospital Portal.
              </p>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                By publishing live counts for ICU beds, mechanical ventilators, and general ward turnover, healthcare systems prevent ED crowding and ensure inbound trauma matches clinical readiness.
              </p>

              <div style={{ paddingTop: '0.5rem' }}>
                <Link
                  to="/hospital/login"
                  className="btn btn-secondary btn-lg"
                  style={{ gap: '0.65rem' }}
                >
                  <Hospital size={18} />
                  Enter Hospital Portal
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Real Hospital Staff Image with 3D Glass Frame */}
            <div
              className="resq-card"
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(255, 255, 255, 0.82)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: 'var(--shadow-3d)',
              }}
            >
              <div
                style={{
                  borderRadius: 'calc(var(--radius-xl) - 6px)',
                  overflow: 'hidden',
                  aspectRatio: '4 / 3',
                  position: 'relative',
                }}
              >
                <img
                  src={hospitalStaffImg}
                  alt="Hospital operations and triage coordination staff managing resource availability"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA (3D Deep Navy & Royal Blue Glass Hero) */}
      <section
        style={{
          padding: '5rem 0 6rem',
          position: 'relative',
        }}
      >
        <div className="container-narrow">
          <div
            className="glass-navy-panel"
            style={{
              padding: '4rem 2.5rem',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.75rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top specular shimmer overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '45%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: '#BAE6FD',
              }}
            >
              <Sparkles size={13} />
              Mission Critical Healthcare Infrastructure
            </span>

            <h2
              style={{
                fontSize: 'clamp(2.1rem, 4vw, 2.75rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                maxWidth: '640px',
              }}
            >
              When every minute matters, make every decision count.
            </h2>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#BAE6FD',
                maxWidth: '560px',
                lineHeight: 1.65,
              }}
            >
              Connect your emergency dispatch workflow with live hospital capacity and turn travel time into saved lives.
            </p>

            <div style={{ paddingTop: '0.75rem' }}>
              <Link
                to="/ambulance"
                className="btn btn-primary btn-lg"
                style={{
                  gap: '0.75rem',
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                }}
              >
                <Ambulance size={22} />
                Find a Hospital Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
