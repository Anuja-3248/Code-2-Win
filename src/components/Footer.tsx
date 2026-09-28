import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(186, 230, 253, 0.5)',
        padding: '3.5rem 0 2.25rem',
        marginTop: 'auto',
        boxShadow: '0 -4px 20px rgba(10, 25, 47, 0.03)',
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
            borderBottom: '1px solid rgba(186, 230, 253, 0.4)',
          }}
        >
          {/* Left: Brand and Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <Logo size="md" />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Connecting emergencies to verified hospital care, faster.
            </p>
          </div>

          {/* Right: Minimal Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <a
              href="#how-it-works"
              style={{ fontSize: '0.925rem', color: 'var(--text-navy)', fontWeight: 600, transition: 'color var(--transition-fast)' }}
            >
              How It Works
            </a>
            <span style={{ color: 'rgba(147, 197, 253, 0.6)' }}>·</span>
            <Link
              to="/hospital/login"
              style={{ fontSize: '0.925rem', color: 'var(--text-navy)', fontWeight: 600, transition: 'color var(--transition-fast)' }}
            >
              Hospital Portal
            </Link>
            <span style={{ color: 'rgba(147, 197, 253, 0.6)' }}>·</span>
            <a
              href="#about"
              style={{ fontSize: '0.925rem', color: 'var(--text-navy)', fontWeight: 600, transition: 'color var(--transition-fast)' }}
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
            color: 'var(--text-muted)',
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

