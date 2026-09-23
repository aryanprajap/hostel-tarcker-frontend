import React from 'react';

/**
 * Shield of Trust Logo Component ("Protected and resolved")
 *
 * @param {number} size - Pixel size of the icon (default: 40)
 * @param {boolean} showText - Whether to render the "HostelTrack" text next to the icon
 * @param {string} subtitle - Subtitle text below the title (default: "Protected and resolved")
 * @param {string} className - Optional container class
 */
export default function ShieldLogo({
  size = 40,
  showText = false,
  subtitle = 'Protected and resolved',
  className = '',
  style = {}
}) {
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shield-trust-logo-svg"
      style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.35))' }}
    >
      <defs>
        {/* Shield Gradient */}
        <linearGradient id="shieldTrustGrad" x1="16" y1="12" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="45%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Shield Inner Gloss */}
        <linearGradient id="shieldGloss" x1="60" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Checkmark Badge Gradient */}
        <linearGradient id="checkBadgeGrad" x1="72" y1="62" x2="104" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Badge Glow */}
        <filter id="badgeShadow" x="66" y="58" width="46" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#059669" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* ── Outer Shield Body ── */}
      <path
        d="M60 14 C82 14 100 21 103 35 C103 66 84 94 60 106 C36 94 17 66 17 35 C20 21 38 14 60 14 Z"
        fill="url(#shieldTrustGrad)"
      />

      {/* Shield Inner Bevel / Highlight */}
      <path
        d="M60 17 C80 17 96 23 99 36 C99 64 82 89 60 101 C38 89 21 64 21 36 C24 23 40 17 60 17 Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
      />

      {/* Shield Top Gloss */}
      <path
        d="M60 15 C79 15 95 21 98 34 C98 50 88 68 76 78 C70 54 60 30 40 20 C46 16 53 15 60 15 Z"
        fill="url(#shieldGloss)"
      />

      {/* ── Hostel Building Icon ── */}
      <g transform="translate(42, 34)">
        {/* Building Base */}
        <rect
          x="0"
          y="0"
          width="36"
          height="40"
          rx="5"
          fill="#FFFFFF"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}
        />

        {/* Top Windows */}
        <rect x="6" y="7" width="8" height="7" rx="1.5" fill="#4F46E5" />
        <rect x="22" y="7" width="8" height="7" rx="1.5" fill="#F59E0B" />

        {/* Middle Windows */}
        <rect x="6" y="18" width="8" height="7" rx="1.5" fill="#4F46E5" />
        <rect x="22" y="18" width="8" height="7" rx="1.5" fill="#4F46E5" />

        {/* Entrance Door */}
        <rect x="14" y="27" width="8" height="13" rx="2" fill="#4F46E5" />
      </g>

      {/* ── Circular "Resolved" Checkmark Badge ── */}
      <g filter="url(#badgeShadow)">
        {/* Outer Cutout Ring */}
        <circle cx="88" cy="80" r="18" fill="#070D1A" stroke="#0D1526" strokeWidth="2" />
        {/* Badge Background */}
        <circle cx="88" cy="80" r="14.5" fill="url(#checkBadgeGrad)" />
        {/* Checkmark Mark */}
        <path
          d="M81.5 80 L86 84.5 L94.5 75.5"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );

  if (!showText) {
    return (
      <div className={`shield-logo-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
        {icon}
      </div>
    );
  }

  return (
    <div
      className={`shield-logo-brand ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        userSelect: 'none',
        ...style
      }}
    >
      {icon}
      <div className="shield-logo-text-block">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: size * 0.46, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Hostel
          </span>
          <span style={{ fontSize: size * 0.46, fontWeight: 800, color: 'var(--accent-light)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Track
          </span>
        </div>
        {subtitle && (
          <p style={{ margin: 0, fontSize: Math.max(10.5, size * 0.22), color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1.2 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
