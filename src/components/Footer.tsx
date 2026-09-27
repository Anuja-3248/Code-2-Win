import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container-responsive">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {/* Left: Brand and Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Logo size="md" />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Connecting emergencies to available care.
            </p>
          </div>

          {/* Right: Minimal Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a
              href="#how-it-works"
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              How It Works
            </a>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <Link
              to="/hospital/login"
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              Hospitals
            </Link>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <a
              href="#about"
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}
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
            © 2026 ResQLink. All rights reserved.
          </div>
          <div>
            Designed for emergency medical response and hospital resource coordination.
          </div>
        </div>
      </div>
    </footer>
  );
};
