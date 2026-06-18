import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Bell, Settings, ChevronRight,
  Sun, Moon, Factory, Tag, Users, Shuffle, Globe, BarChart2,
  ShieldCheck, MapPin, Star, Microscope, ChevronDown, Sparkles, Zap
} from 'lucide-react';

import SpendOverview from './pages/SpendOverview';
import PlantWiseSpend from './pages/PlantWiseSpend';
import CategoryWiseSpend from './pages/CategoryWiseSpend';
import SupplierWiseSpend from './pages/SupplierWiseSpend';
import SourcingControl from './pages/SourcingControl';
import ImportDomestic from './pages/ImportDomestic';
import CommodityTrends from './pages/CommodityTrends';
import SupplierPerformance from './pages/SupplierPerformance';
import PlantRating from './pages/PlantRating';
import QualityDelivery from './pages/QualityDelivery';
import QualityDeepDive from './pages/QualityDeepDive';
import SupplierConsolidation from './pages/SupplierConsolidation';
import PartPriceVariance from './pages/PartPriceVariance';
import AlertPanel from './components/AlertPanel';
import './index.css';

// ─── Theme Hook ────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('lumax-theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumax-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((p) => (p === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggleTheme };
}

// ─── Nav Group ─────────────────────────────────────────────────────────────
function NavGroup({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="nav-group">
      <button className="nav-group-label" onClick={() => setOpen((o) => !o)}>
        {label}
        <ChevronDown size={12} className={`nav-group-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && <div className="nav-group-items">{children}</div>}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo-area">
        <div className="sidebar-logo">
          <div className="brand-row">
            <img
              src="https://www.lumaxworld.in/images/main-logo.svg"
              alt="Lumax Group"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
            />
          </div>
          <span className="sidebar-product-name">Spend Cube</span>
        </div>
        <div className="powered-by sidebar-powered-by">
          <span>Powered by</span>
          <a href="/">
            <img
              src="https://amlgolabs.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo21march.9d40d63c.png&w=640&q=75"
              alt="AMLGO LABS"
              className="powered-by-logo"
            />
          </a>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavGroup label="Overview" defaultOpen>
          <NavLink to="/executive-summary" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-executive">
            <LayoutDashboard size={16} /> Executive Summary
          </NavLink>
        </NavGroup>

        <NavGroup label="Spend Analysis" defaultOpen>
          <NavLink to="/plant-wise-spend" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-plant-spend">
            <Factory size={16} /> Plant-wise Spend
          </NavLink>
          <NavLink to="/category-wise-spend" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-category-spend">
            <Tag size={16} /> Category-wise Spend
          </NavLink>
          <NavLink to="/supplier-wise-spend" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-supplier-spend">
            <Users size={16} /> Supplier-wise Spend
          </NavLink>
          <NavLink to="/sourcing-control" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-sourcing">
            <Shuffle size={16} /> Sourcing Control
          </NavLink>
          <NavLink to="/import-domestic" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-import">
            <Globe size={16} /> Import vs Domestic
          </NavLink>
          <NavLink to="/commodity-trends" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-commodity">
            <BarChart2 size={16} /> LME &amp; Commodity
          </NavLink>
        </NavGroup>

        <NavGroup label="Supplier Performance" defaultOpen>
          <NavLink to="/supplier-performance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-ratings">
            <ShieldCheck size={16} /> Ratings Overview
          </NavLink>
          <NavLink to="/plant-rating" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-plant-rating">
            <MapPin size={16} /> Plant-Level Rating
          </NavLink>
          <NavLink to="/quality-delivery" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-quality-delivery">
            <Star size={16} /> Quality &amp; Delivery
          </NavLink>
          <NavLink to="/quality-deep-dive" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-quality-dive">
            <Microscope size={16} /> Quality Deep Dive
          </NavLink>
        </NavGroup>

        <NavGroup label="AI Insights" defaultOpen>
          <NavLink to="/ai-supplier-consolidation" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-ai-consolidation">
            <Sparkles size={16} /> Supplier Consolidation
          </NavLink>
          <NavLink to="/ai-part-price-variance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-ai-variance">
            <Zap size={16} /> Part Price Variance
          </NavLink>
        </NavGroup>

        <NavGroup label="System" defaultOpen={false}>
          <NavLink to="/alerts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-alerts-page">
            <Bell size={16} /> Alerts &amp; Triggers
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} id="nav-settings">
            <Settings size={16} /> Settings
          </NavLink>
        </NavGroup>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          <strong>Lumax Group</strong>
          Procurement Intelligence Platform
        </div>
      </div>
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header({ title, parent, theme, onToggleTheme, onToggleAlerts, alertCount }) {
  return (
    <div className="header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="breadcrumb-parent">{parent || 'Analytics'}</span>
          <ChevronRight size={13} color="var(--text-muted)" />
          <h1>{title}</h1>
        </div>
      </div>
      <div className="header-right">
        <div className="header-badge" id="live-status-badge">
          <span className="dot" /> Live Data
        </div>
        <button className="theme-toggle" onClick={onToggleTheme} id="theme-toggle-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="alert-bell-btn" onClick={onToggleAlerts} id="alert-bell-btn" aria-label="Toggle alerts">
          <Bell size={16} />
          {alertCount > 0 && <span className="alert-bell-badge">{alertCount}</span>}
        </button>
        <div className="user-profile" id="user-profile-pill">
          <div className="avatar">PH</div>
          <span>Procurement Head</span>
        </div>
      </div>
    </div>
  );
}

// ─── App Layout ────────────────────────────────────────────────────────────
function AppLayout({ children, title, parent, theme, onToggleTheme, alertOpen, onToggleAlerts, alertCount }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header title={title} parent={parent} theme={theme}
          onToggleTheme={onToggleTheme} onToggleAlerts={onToggleAlerts} alertCount={alertCount} />
        <div className={`content-with-alert ${alertOpen ? 'alert-visible' : ''}`}>
          <div className="page-content">{children}</div>
          <AlertPanel isOpen={alertOpen} onClose={onToggleAlerts} />
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder ───────────────────────────────────────────────────────────
function PlaceholderPage({ title, icon: Icon }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent" />{title}</h2></div>
      </div>
      <div className="chart-container" style={{ textAlign: 'center', padding: '3rem' }}>
        {Icon && <Icon size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />}
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{title} — Coming Soon</p>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────
function App() {
  const { theme, toggleTheme } = useTheme();
  const [alertOpen, setAlertOpen] = useState(false);
  const toggleAlerts = useCallback(() => setAlertOpen((o) => !o), []);

  const layout = (title, parent, Child) => (
    <AppLayout title={title} parent={parent} theme={theme}
      onToggleTheme={toggleTheme} alertOpen={alertOpen}
      onToggleAlerts={toggleAlerts} alertCount={3}>
      <Child />
    </AppLayout>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/executive-summary" replace />} />
        <Route path="/executive-summary" element={layout('Executive Summary', 'Overview', SpendOverview)} />
        <Route path="/spend-overview" element={<Navigate to="/executive-summary" replace />} />
        <Route path="/plant-wise-spend" element={layout('Plant-wise Spend', 'Spend Analysis', PlantWiseSpend)} />
        <Route path="/category-wise-spend" element={layout('Category-wise Spend', 'Spend Analysis', CategoryWiseSpend)} />
        <Route path="/supplier-wise-spend" element={layout('Supplier-wise Spend', 'Spend Analysis', SupplierWiseSpend)} />
        <Route path="/sourcing-control" element={layout('Sourcing Control', 'Spend Analysis', SourcingControl)} />
        <Route path="/import-domestic" element={layout('Import vs Domestic', 'Spend Analysis', ImportDomestic)} />
        <Route path="/commodity-trends" element={layout('LME & Commodity Trends', 'Spend Analysis', CommodityTrends)} />
        <Route path="/supplier-performance" element={layout('Supplier Ratings Overview', 'Supplier Performance', SupplierPerformance)} />
        <Route path="/plant-rating" element={layout('Plant-Level Rating', 'Supplier Performance', PlantRating)} />
        <Route path="/quality-delivery" element={layout('Quality & Delivery', 'Supplier Performance', QualityDelivery)} />
        <Route path="/quality-deep-dive" element={layout('Quality Deep Dive', 'Supplier Performance', QualityDeepDive)} />
        <Route path="/ai-supplier-consolidation" element={layout('Supplier Consolidation', 'AI Insights', SupplierConsolidation)} />
        <Route path="/ai-part-price-variance" element={layout('Part Price Variance', 'AI Insights', PartPriceVariance)} />
        <Route path="/alerts" element={layout('Alerts & Triggers', 'System', () => <PlaceholderPage title="Alerts & Triggers" icon={Bell} />)} />
        <Route path="/settings" element={layout('Settings', 'System', () => <PlaceholderPage title="Settings" icon={Settings} />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
