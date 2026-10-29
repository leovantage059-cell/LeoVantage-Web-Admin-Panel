import React from 'react';

/**
 * Official LeoVantage Brand Logo Component for Admin OS
 * Variants:
 * - 'horizontal' (default): Symbol + "LeoVantage" wordmark + "STUDIO CONSOLE"
 * - 'icon': Brand symbol only
 * - 'squircle': App-icon style with dark rounded background
 */
export default function Logo({
  variant = 'horizontal',
  theme = 'dark', // 'dark' | 'light'
  height = 32,
  subtitle = 'STUDIO CONSOLE',
  className = ''
}) {
  const isDark = theme === 'dark';
  const frameColor = isDark ? '#FFFFFF' : '#0F172A';
  const dot1Color = isDark ? '#121A2E' : '#FFFFFF';
  const dot2Color = '#C7F36B';
  const shieldColor = '#C7F36B';
  const arrowColor = isDark ? '#FFFFFF' : '#0F172A';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subTextColor = isDark ? '#94A3B8' : '#64748B';

  const renderMark = () => (
    <g id="leovantage-mark">
      {/* Top-Left Framing Element */}
      <path
        d="M80 405 V175 C80 120 120 80 175 80 H395 C417 80 435 98 435 120 C435 142 417 160 395 160 H185 C171 160 160 171 160 185 V405 C160 411 155 416 149 416 H91 C85 416 80 411 80 405 Z"
        fill={frameColor}
      />
      {/* Dot 1 on horizontal bar */}
      <circle cx="330" cy="120" r="17" fill={dot1Color} />
      {/* Dot 2 on horizontal bar (Electric Lime) */}
      <circle cx="384" cy="120" r="17" fill={dot2Color} />
      {/* Center Arrow / Cursor */}
      <path
        d="M208 285 L318 358 L262 368 L286 428 L256 440 L232 380 L208 424 Z"
        fill={arrowColor}
      />
      {/* Lower-Right Growth Shield / Polygon (Electric Lime) */}
      <path
        d="M232 200 C221 200 220 209 220 220 V252 L342 333 C348 337 356 333 356 325 V385 L412 352 C417 349 420 344 420 338 V220 C420 209 411 200 400 200 Z"
        fill={shieldColor}
      />
    </g>
  );

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        className={className}
        style={{ display: 'block', flexShrink: 0 }}
        aria-label="LeoVantage Emblem"
      >
        {renderMark()}
      </svg>
    );
  }

  if (variant === 'squircle') {
    return (
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        className={className}
        style={{ display: 'block', flexShrink: 0 }}
        aria-label="LeoVantage Studio Icon"
      >
        <rect width="512" height="512" rx="115" fill={isDark ? '#1C2740' : '#E2E8F0'} />
        <rect width="512" height="512" rx="115" fill="none" stroke={isDark ? 'rgba(199, 243, 107, 0.25)' : 'rgba(15, 23, 42, 0.1)'} strokeWidth="6" />
        <g transform="translate(51.2, 51.2) scale(0.8)">{renderMark()}</g>
      </svg>
    );
  }

  // Horizontal Logo with Wordmark + Studio Lockup
  const aspectRatio = 390 / 88;
  const computedWidth = height * aspectRatio;

  return (
    <svg
      viewBox="0 0 390 88"
      height={height}
      width={computedWidth}
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
      aria-label="LeoVantage Studio Console"
    >
      <g transform="translate(-13, -11) scale(0.21)">{renderMark()}</g>
      <text
        x="92"
        y="50"
        fontFamily="'Sora', 'Plus Jakarta Sans', -apple-system, sans-serif"
        fontWeight="800"
        fontSize="44"
        letterSpacing="-0.025em"
        fill={textColor}
      >
        Leo<tspan fill={textColor}>Vantage</tspan>
      </text>
      <text
        x="94"
        y="75"
        fontFamily="'Inter', -apple-system, sans-serif"
        fontWeight="700"
        fontSize="16"
        letterSpacing="0.22em"
        fill={subTextColor}
      >
        {subtitle}
      </text>
    </svg>
  );
}
