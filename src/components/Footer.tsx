import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'rgba(4, 10, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '3.5rem 0 2.25rem',
        marginTop: 'auto',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div className="container-responsive">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.75rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          {/* Left: Brand and Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <Logo size="md" />
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 500 }}>
              Connecting emergencies to verified hospital care, faster.
            </p>
          </div>

          {/* Right: Minimal Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <a
              href="#how-it-works"
              style={{ fontSize: '0.925rem', color: '#BAE6FD', fontWeight: 600, transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#BAE6FD')}
            >
              How It Works
            </a>
            <span style={{ color: 'rgba(56, 189, 248, 0.3)' }}>·</span>
            <Link
              to="/hospital/login"
              style={{ fontSize: '0.925rem', color: '#BAE6FD', fontWeight: 600, transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#BAE6FD')}
            >
              Hospital Portal
            </Link>
            <span style={{ color: 'rgba(56, 189, 248, 0.3)' }}>·</span>
            <a
              href="#about"
              style={{ fontSize: '0.925rem', color: '#BAE6FD', fontWeight: 600, transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#BAE6FD')}
            >
              About
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.825rem',
            color: '#64748B',
          }}
        >
          <div>
            © 2026 ResQLink Emergency Health Network. All rights reserved.
          </div>
          <div>
            Engineered with real-time clinical bed telemetry & predictive resource dispatch.
          </div>
        </div>
      </div>
    </footer>
  );
};
