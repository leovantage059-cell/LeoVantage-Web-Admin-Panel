import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ 
  label, 
  value, 
  icon: IconComponent, 
  delta, 
  deltaType = 'neutral', // 'up' | 'down' | 'neutral'
  accent = 'lime' 
}) {
  return (
    <div className={`kpi-card accent-${accent}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {IconComponent && (
          <div className="kpi-icon-wrap">
            {React.isValidElement(IconComponent) ? (
              IconComponent
            ) : (
              React.createElement(IconComponent, { size: 15, strokeWidth: 2 })
            )}
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={`kpi-delta delta-${deltaType}`}>
          {deltaType === 'up' && <TrendingUp size={13} strokeWidth={2.2} />}
          {deltaType === 'down' && <TrendingDown size={13} strokeWidth={2.2} />}
          {deltaType === 'neutral' && <Minus size={12} strokeWidth={2} style={{ opacity: 0.6 }} />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
