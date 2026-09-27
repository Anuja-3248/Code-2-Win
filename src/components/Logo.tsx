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
      {/* ResQLink Brand Icon: Medical Cross with Node Connection */}
      <div
        style={{
          width: iconDimensions.box,
          height: iconDimensions.box,
          backgroundColor: 'var(--primary)',
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 6px rgba(23, 107, 135, 0.2)',
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
          <path d="M12 4v16" />
          <path d="M4 12h16" />
          {/* Subtle Connection Link Ring */}
          <circle cx="12" cy="12" r="3" fill="var(--secondary)" stroke="#FFFFFF" strokeWidth="1.2" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: titleSizes,
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}
        >
          ResQ<span style={{ color: 'var(--primary)' }}>Link</span>
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
