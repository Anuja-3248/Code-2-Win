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
    sm: { box: 28, stroke: 2.2 },
    md: { box: 34, stroke: 2.2 },
    lg: { box: 42, stroke: 2.4 },
  }[size];

  const titleSizes = {
    sm: '1.2rem',
    md: '1.35rem',
    lg: '1.65rem',
  }[size];

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', userSelect: 'none' }}>
      {/* ResQLink Brand Icon: Medical Cross with Node Connection with 3D Glass Look */}
      <div
        style={{
          width: iconDimensions.box,
          height: iconDimensions.box,
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.5), 0 4px 12px rgba(29, 78, 216, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
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
            fontWeight: 850,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}
        >
          ResQ<span style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #60A5FA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 15px rgba(56, 189, 248, 0.3)' }}>Link</span>
        </span>

        {showTagline && (
          <span
            style={{
              fontSize: '0.8rem',
              color: '#94A3B8',
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
