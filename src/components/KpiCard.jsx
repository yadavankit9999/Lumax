import React from 'react';

/**
 * KpiCard — reusable KPI metric card.
 * Props:
 *   title:       string
 *   value:       string | number
 *   subtext:     string
 *   trend:       'up' | 'down' | 'neutral' | null
 *   trendValue:  string  (e.g. "+8.5%")
 *   icon:        React element
 *   accentColor: CSS color string (overrides red default)
 *   id:          string
 */
export default function KpiCard({ title, value, subtext, trend, trendValue, icon, accentColor, id }) {
  const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';
  const iconStyle = accentColor
    ? { background: `${accentColor}18`, borderColor: `${accentColor}33`, color: accentColor }
    : {};

  return (
    <div className="card" id={id}>
      {icon && (
        <div className="card-icon-wrap" style={iconStyle}>
          {icon}
        </div>
      )}
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {(subtext || trendValue) && (
        <div className="card-meta">
          {trendValue && <span className={trendClass}>{trendValue}&nbsp;</span>}
          {subtext}
        </div>
      )}
    </div>
  );
}
