import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ambulance,
  Hospital,
  ArrowRight,
  CheckCircle2,
  MapPin,
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
          backgroundColor: '#FFFFFF',
          padding: '4.5rem 0 5rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container-responsive">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h1
                style={{
                  fontSize: 'clamp(2.35rem, 4.5vw, 3.25rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                }}
              >
                The right care, when every minute matters.
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                }}
              >
                ResQLink helps emergency teams find nearby hospitals with the resources they need — using real-time availability and proximity.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  paddingTop: '0.5rem',
                }}
              >
                <Link
                  to="/ambulance"
                  className="btn btn-primary btn-lg"
                  style={{ gap: '0.6rem' }}
                >
                  <Ambulance size={20} />
                  Find a Hospital
                </Link>

                <Link
                  to="/hospital/login"
                  className="btn btn-secondary btn-lg"
                  style={{ gap: '0.6rem' }}
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
                  gap: '1.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  <span>Instant ambulance access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  <span>Real-time hospital capacity</span>
                </div>
              </div>
            </div>

            {/* Right: High-quality real photograph of paramedics */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: 'var(--bg-section)',
                  aspectRatio: '4 / 3',
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
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section
        id="about"
        style={{
          backgroundColor: 'var(--bg-section)',
          padding: '5.5rem 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container-responsive">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Real Doctor Care Photograph */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                aspectRatio: '4 / 3',
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

            {/* Editorial Text Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.85rem, 3.2vw, 2.35rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
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
                When transporting a patient in critical condition, emergency teams cannot afford the risk of arriving at a facility with zero available ICU beds or unavailable ventilators.
              </p>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                ResQLink helps reduce uncertainty by showing available hospital resources before arrival. By connecting ambulances with live hospital capacity and real-time travel times, emergency teams make confident decisions without delay.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    &lt; 10s
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Emergency Match Speed
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Live
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Real-Time Bed Tracking
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Transparent Availability
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
          backgroundColor: '#FFFFFF',
          padding: '5.5rem 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container-responsive">
          {/* Section Header */}
          <div style={{ maxWidth: '680px', marginBottom: '3.5rem' }}>
            <h2
              style={{
                fontSize: 'clamp(1.85rem, 3vw, 2.35rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.25,
              }}
            >
              From emergency request to suitable care — in three simple steps.
            </h2>
          </div>

          {/* 3 Simple Numbered Steps with Thin Connecting Lines */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              position: 'relative',
            }}
          >
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1,
                  }}
                >
                  01
                </span>
                <div
                  style={{
                    height: '1px',
                    flex: 1,
                    backgroundColor: 'var(--border-color)',
                  }}
                />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Tell us what is needed
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Select the required resource (ICU, Ventilator, or General Bed), quantity required, and ambulance location.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1,
                  }}
                >
                  02
                </span>
                <div
                  style={{
                    height: '1px',
                    flex: 1,
                    backgroundColor: 'var(--border-color)',
                  }}
                />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                We check nearby hospitals
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ResQLink evaluates hospitals based on distance, estimated travel time, and real-time resource availability.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1,
                  }}
                >
                  03
                </span>
                <div
                  style={{
                    height: '1px',
                    flex: 1,
                    backgroundColor: 'var(--border-color)',
                  }}
                />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Choose where to go
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                View suitable hospitals and their current live availability, and navigate directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT PREVIEW SECTION (Light Teal Background) */}
      <section
        style={{
          backgroundColor: 'var(--bg-teal-section)',
          padding: '5.5rem 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container-responsive">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2
              style={{
                fontSize: 'clamp(1.85rem, 3vw, 2.35rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '0.75rem',
              }}
            >
              Know what is available before you arrive.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A clean, clear interface built for fast decision-making during high-stress emergency dispatches.
            </p>
          </div>

          {/* Large, Clean Mockup of the Hospital Results Interface */}
          <div
            style={{
              maxWidth: '860px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary-border)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Mock Window Header */}
            <div
              style={{
                backgroundColor: 'var(--bg-section)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.85rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#CBD5E1', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#CBD5E1', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#CBD5E1', display: 'inline-block' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                  resqlink.org/ambulance/results
                </span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                3 Suitable Matches
              </span>
            </div>

            {/* Mock Content */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Request Summary */}
              <div
                style={{
                  backgroundColor: 'var(--bg-section)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>Requested: <strong style={{ color: 'var(--primary)' }}>2 ICU Beds</strong></span>
                  <span>Location: <strong>Pune, Maharashtra</strong></span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Live GPS Matched</span>
              </div>

              {/* Hospital Card 1 - Ruby Care */}
              <div
                style={{
                  border: '1.5px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Ruby Care Hospital
                      </h4>
                      <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                        Available
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <MapPin size={13} style={{ color: 'var(--primary)' }} />
                      <span>40 Sassoon Road, Sangamvadi, Pune</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: 'var(--bg-section)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>3.2 km</span>
                    <span style={{ color: 'var(--border-color)' }}>|</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>9 min ETA</span>
                  </div>
                </div>

                {/* Live Availability strip */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-section)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Current Live Availability</span>
                    <div style={{ fontWeight: 800, color: '#1e7e48', fontSize: '1.15rem' }}>4 ICU Beds Available</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Facility Capacity</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>24 Total ICU Beds</div>
                  </div>
                </div>
              </div>

              {/* Hospital Card 2 - CityCare */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        CityCare Hospital
                      </h4>
                      <span className="badge badge-teal" style={{ fontSize: '0.725rem' }}>
                        Suitable
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <MapPin size={13} style={{ color: 'var(--primary)' }} />
                      <span>Connaught Road, Near Pune Station</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: 'var(--bg-section)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>4.8 km</span>
                    <span style={{ color: 'var(--border-color)' }}>|</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>12 min ETA</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-section)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Current Live Availability</span>
                    <div style={{ fontWeight: 800, color: '#1e7e48', fontSize: '1.15rem' }}>6 ICU Beds Available</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Facility Capacity</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>30 Total ICU Beds</div>
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
          backgroundColor: '#FFFFFF',
          padding: '5.5rem 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container-responsive">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.85rem, 3.2vw, 2.35rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
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
                Hospitals can keep their emergency resource information up to date in seconds through the Hospital Portal.
              </p>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                By publishing live counts for ICU beds, mechanical ventilators, and general ward turnover, facilities prevent department overload and ensure incoming patients match available clinical capability.
              </p>

              <div style={{ paddingTop: '0.5rem' }}>
                <Link
                  to="/hospital/login"
                  className="btn btn-secondary btn-lg"
                  style={{ gap: '0.6rem' }}
                >
                  <Hospital size={18} />
                  Hospital Portal
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Real Hospital Staff Image */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                aspectRatio: '4 / 3',
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
      </section>

      {/* 6. FINAL CTA (Calm Light-Teal Section) */}
      <section
        style={{
          backgroundColor: 'var(--bg-teal-section)',
          padding: '5rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container-narrow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.65rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.025em',
            }}
          >
            When every minute matters, make every decision count.
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.6,
            }}
          >
            Identify suitable hospital care with real-time resource availability and proximity in seconds.
          </p>

          <div style={{ paddingTop: '0.5rem' }}>
            <Link
              to="/ambulance"
              className="btn btn-primary btn-lg"
              style={{ gap: '0.65rem', padding: '0.95rem 2.25rem', fontSize: '1.1rem' }}
            >
              <Ambulance size={20} />
              Find a Hospital
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
