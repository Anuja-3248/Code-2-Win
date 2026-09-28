import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  clickable?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = true,
}) => {
  const iconDimensions = {
    sm: { box: 26, stroke: 2.2 },
    md: { box: 32, stroke: 2.2 },
    lg: { box: 40, stroke: 2.4 },
  }[size];

  const titleSizes = {
    sm: '1.15rem',
    md: '1.3rem',
    lg: '1.55rem',
  }[size];

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', userSelect: 'none' }}>
      {/* ResQLink Brand Icon: Medical Cross with Node Connection with 3D Glass Look */}
      <div
        style={{
          width: iconDimensions.box,
          height: iconDimensions.box,
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 60%, #0A192F 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          flexShrink: 0,
        }}
      >
        <svg
          width={iconDimensions.box * 0.62}
          height={iconDimensions.box * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={iconDimensions.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Medical Cross */}
          <path d="M12 4v16" stroke="#FFFFFF" />
          <path d="M4 12h16" stroke="#FFFFFF" />
          {/* Ice Blue Connection Link Ring */}
          <circle cx="12" cy="12" r="3.2" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: titleSizes,
            fontWeight: 800,
            color: 'var(--text-navy)',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}
        >
          ResQ<span style={{ color: 'var(--royal-600)', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
        </span>

        {showTagline && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginTop: '1px',
            }}
          >
            Connecting ambulances to the right care, faster.
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex' }} aria-label="ResQLink Home">
        {content}
      </Link>
    );
  }

  return content;
};
