import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Hospital, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  onComplete?: () => void;
  durationMs?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  onComplete,
  durationMs = 2400,
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'Ambulance location received', detail: 'GPS lock validated at 18.5204° N, 73.8567° E' },
    { label: 'Checking hospital availability', detail: 'Querying 10 nearest emergency centers' },
    { label: 'Evaluating predicted capacity', detail: 'Computing 30-minute machine learning forecast' },
    { label: 'Optimizing recommendations', detail: 'Ranking by ETA, resource buffer & traffic models' },
  ];

  useEffect(() => {
    const stepInterval = durationMs / steps.length;
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepInterval);

    const completionTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(completionTimer);
    };
  }, [durationMs, onComplete, steps.length]);

  return (
    <div
      className="resq-card animate-fade-in"
      style={{
        maxWidth: 580,
        margin: '2rem auto',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--primary-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Central Animated Pulse Symbol */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          position: 'relative',
        }}
      >
        <Hospital size={32} />
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            color: 'var(--primary)',
          }}
        >
          <Sparkles size={18} />
        </span>
      </div>

      <h2 style={{ fontSize: '1.45rem', marginBottom: '0.4rem' }}>
        Finding Suitable Hospitals...
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        Matching your emergency request with real-time hospital resource availability and predictive capacity.
      </p>

      {/* Progress Checklist Steps */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          textAlign: 'left',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
        }}
      >
        {steps.map((s, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: isDone || isCurrent ? 1 : 0.45,
                transition: 'opacity 0.25s ease',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                {isDone ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                ) : isCurrent ? (
                  <Loader2 size={18} style={{ color: 'var(--primary)' }} className="status-dot-pulse" />
                ) : (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid var(--border-color)',
                    }}
                  />
                )}
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent || isDone ? 600 : 500,
                    color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-secondary)',
                  }}
                >
                  {s.label}
                </div>
                {(isCurrent || isDone) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {s.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
