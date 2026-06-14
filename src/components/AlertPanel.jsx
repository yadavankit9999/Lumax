import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info, ChevronRight, Bell } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SEVERITY_CONFIG = {
  L3: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  Icon: AlertCircle },
  L2: { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.1)', Icon: AlertTriangle },
  L1: { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: AlertTriangle },
  L0: { label: 'Info',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', Icon: Info },
};

export default function AlertPanel({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([]);

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
