import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info, ChevronRight, Bell, Sparkles, Zap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SEVERITY_CONFIG = {
  L3: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  Icon: AlertCircle },
  L2: { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.1)', Icon: AlertTriangle },
  L1: { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: AlertTriangle },
  L0: { label: 'Info',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', Icon: Info },
};

export default function AlertPanel({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/alerts`)
      .then((r) => r.json())
      .then(setAlerts)
      .catch(console.error);
  }, []);

  const counts = {
    L3: alerts.filter((a) => a.level === 'L3').length,
    L2: alerts.filter((a) => a.level === 'L2').length,
    L1: alerts.filter((a) => a.level === 'L1').length,
    L0: alerts.filter((a) => a.level === 'L0').length,
  };

  return (
    <div className={`alert-panel ${isOpen ? 'alert-panel--open' : ''}`} id="alert-panel">
      {/* Header */}
      <div className="alert-panel-header">
        <div className="alert-panel-title">
          <Bell size={16} />
          Alert Center
        </div>
        <button className="alert-panel-close" onClick={onClose} aria-label="Close alerts">
          <X size={16} />
        </button>
      </div>

      {/* Severity summary pills */}
      <div className="alert-severity-row">
        {Object.entries(SEVERITY_CONFIG).map(([level, cfg]) => (
          <div key={level} className="alert-severity-pill" style={{ background: cfg.bg, color: cfg.color }}>
            <cfg.Icon size={12} />
            {counts[level]} {cfg.label}
          </div>
        ))}
      </div>

      {/* Alert list */}
      <div className="alert-list">
        {alerts.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.level];
          const isExpanded = expandedId === alert.id;

          if (alert.aiAlert) {
            const Icon = alert.aiType === 'consolidation' ? Sparkles : Zap;
            const accentColor = alert.aiType === 'consolidation' ? '#dc2626' : '#ca8a04';
            const details = alert.details;

            return (
              <div key={alert.id} className="alert-item ai-alert-item" style={{ borderLeftColor: accentColor }}>
                <div className="alert-item-header" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : alert.id)}>
                  <span className="alert-item-type" style={{ color: accentColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon size={14} /> Automated AI alert
                  </span>
                  <span className="alert-item-time">{alert.time}</span>
                </div>
                
                <h4 style={{ margin: '8px 0 4px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{alert.message}</h4>
                
                {isExpanded && details && (
                  <div className="ai-alert-details" style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span className="badge badge-gray">Sub-category: {details.subCategory}</span>
                      <span className="badge badge-gray">Category: {details.category}</span>
                      <span className="badge badge-red">Severity: {details.severity}</span>
                    </div>
                    
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                      {details.message}
                    </p>

                    {alert.aiType === 'consolidation' && (
                      <div className="grid-cards alert-mini-grid">
                        <div className="mini-kpi"><span>Current</span><strong>{details.currentBase}</strong></div>
                        <div className="mini-kpi"><span>Recommended</span><strong style={{color: '#0284c7'}}>{details.recommendedBase}</strong></div>
                        <div className="mini-kpi"><span>Spend</span><strong>₹{details.spend}</strong></div>
                        <div className="mini-kpi"><span>Saving</span><strong style={{color: '#16a34a'}}>~₹{details.saving}</strong></div>
                      </div>
                    )}

                    {alert.aiType === 'variance' && (
                      <div className="grid-cards alert-mini-grid">
                        <div className="mini-kpi"><span>SKUs analysed</span><strong>{details.skusAnalysed}</strong></div>
                        <div className="mini-kpi"><span>With gap</span><strong style={{color: '#ef4444'}}>{details.skusWithGap}</strong></div>
                        <div className="mini-kpi"><span>Spend</span><strong>₹{details.spend}</strong></div>
                        <div className="mini-kpi"><span>Saving</span><strong style={{color: '#16a34a'}}>~₹{details.saving}</strong></div>
                      </div>
                    )}

                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-default)', paddingTop: '12px' }}>
                      <a href={alert.dashboard} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem' }}>
                        Click to view the alert <ChevronRight size={12} />
                      </a>
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Update your action</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Acknowledged</button>
                        <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Work in progress</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={alert.id}
              className="alert-item"
              style={{ borderLeftColor: cfg.color }}
            >
              <div className="alert-item-header">
                <span className="alert-item-type" style={{ color: cfg.color }}>
                  <cfg.Icon size={12} />
                  {alert.type}
                </span>
                <span className="alert-item-time">{alert.time}</span>
              </div>
              <p className="alert-item-message">{alert.message}</p>
              <a href={alert.dashboard} className="alert-item-link">
                View Details <ChevronRight size={11} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
