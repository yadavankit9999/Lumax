import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Treemap, LabelList
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, TrendingUp, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const DONUT_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const BAR_COLORS = ['#de0303', '#14b8a6', '#f59e0b'];
const TREEMAP_COLORS = ['#de0303', '#b30202', '#8b0000', '#14b8a6', '#0d9488', '#f59e0b', '#d97706'];

const FILTERS = [
  { key: 'period',   label: 'Period',   options: ['FY2026', 'FY2025', 'Q4 FY26', 'Q3 FY26'] },
  { key: 'entity',   label: 'Entity',   options: ['Entity A', 'Entity B', 'Entity C'] },
  { key: 'plant',    label: 'Plant',    options: ['Gurugram', 'Pune', 'Chennai', 'Manesar'] },
  { key: 'category', label: 'Category', options: ['Raw Materials', 'Components', 'Packaging'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

const CustomTreemapContent = ({ x, y, width, height, name, value, index }) => {
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={TREEMAP_COLORS[index % TREEMAP_COLORS.length]} rx={4} />
      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{name}</text>
      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10}>₹{value} Cr</text>
    </g>
  );
};

export default function SpendOverview() {
  const [overview, setOverview] = useState(null);
  const [exec, setExec] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [categoryWise, setCategoryWise] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/spend/overview`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/executive/summary`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/supplier/ratings`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/spend/category-wise`).then(r => r.json()),
    ]).then(([ov, ex, rt, cat]) => {
      setOverview(ov); setExec(ex); setRatings(rt); setCategoryWise(cat);
    }).catch(console.error);
  }, []);

  const handleFilter = useCallback((key, val) => setFilters(f => ({ ...f, [key]: val })), []);

  if (!overview || !exec || !ratings) {
    return <div className="loading-state"><div className="loading-spinner" /><p>Loading Executive Summary…</p></div>;
  }

  const donutData = ratings.ratingSplit.map(r => ({ name: r.rating, value: r.count }));
  const flatTreemap = exec.treemapData.flatMap((cat, ci) =>
    cat.children.map((child, chi) => ({ ...child, color: TREEMAP_COLORS[(ci * 3 + chi) % TREEMAP_COLORS.length] }))
  );

  return (
    <div>
      <div className="page-title-block">
        <div>
          <h2><span className="page-title-accent" />Executive Summary</h2>
          <p>Single-page procurement command centre — spend, supplier health &amp; alerts.</p>
        </div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      {/* Alert Strip */}
      <div className="alert-strip">
        <div className="alert-strip-item alert-strip-critical">
          <AlertCircle size={14} />
          {exec.alertSummary.critical} Critical
        </div>
        <div className="alert-strip-item alert-strip-due">
          <AlertTriangle size={14} />
          {exec.alertSummary.dueToday} Due Today
        </div>
        <div className="alert-strip-item alert-strip-escalated">
          <ArrowUpRight size={14} />
          {exec.alertSummary.escalated} Escalated
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KpiCard id="kpi-spend"    title="Total Direct Spend" value={`₹${overview.totalDirectSpend.toLocaleString('en-IN')} Cr`} subtext={`Budget: ₹${overview.budgetedSpend.toLocaleString('en-IN')} Cr`} trendValue={`+${overview.variancePercent}%`} trend="down" icon={<DollarSign size={16}/>} />
        <KpiCard id="kpi-budget"   title="Budgeted Spend"     value={`₹${overview.budgetedSpend.toLocaleString('en-IN')} Cr`}    subtext="FY2026 approved" icon={<DollarSign size={16}/>} />
        <KpiCard id="kpi-variance" title="Variance"           value={`+${overview.variancePercent}%`} subtext="Over budget" trend="down" icon={<ArrowUpRight size={16}/>} accentColor="#ef4444" />
        <KpiCard id="kpi-suppliers"title="Active Suppliers"   value={overview.activeSupplierCount}   subtext="Across all plants" icon={<Users size={16}/>} />
        <KpiCard id="kpi-yoy"      title="YoY Spend Change"   value={`+${overview.yoyChange}%`}      subtext="vs FY2025" trend="up" trendValue={`+${overview.yoyChange}%`} icon={<TrendingUp size={16}/>} accentColor="#22c55e" />
        <KpiCard id="kpi-red"      title="Red Suppliers"      value={ratings.ratingSplit.find(r=>r.rating==='Red')?.count||0}    subtext={`${ratings.ratingSplit.find(r=>r.rating==='Red')?.percentage||0}% of base`} icon={<AlertCircle size={16}/>} accentColor="#ef4444" />
        <KpiCard id="kpi-yellow"   title="Yellow Suppliers"   value={ratings.ratingSplit.find(r=>r.rating==='Yellow')?.count||0} subtext={`${ratings.ratingSplit.find(r=>r.rating==='Yellow')?.percentage||0}% of base`} icon={<AlertTriangle size={16}/>} accentColor="#f59e0b" />
        <KpiCard id="kpi-chronic"  title="Chronic Red"        value={ratings.chronicRedSuppliers}    subtext="3+ months in Red" icon={<AlertCircle size={16}/>} accentColor="#b91c1c" />
      </div>

      {/* Treemap + Supplier Donut */}
      <div className="charts-grid">
        <div className="chart-container" id="chart-treemap">
          <div className="chart-header"><h3>Spend Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <Treemap data={flatTreemap} dataKey="size" content={<CustomTreemapContent />} />
          </ResponsiveContainer>
        </div>
        <div className="chart-container" id="chart-supplier-health">
          <div className="chart-header"><h3>Supplier Health</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}
                label={({ x, y, textAnchor, name, value }) => (
                  <text x={x} y={y} textAnchor={textAnchor} fill="var(--text-primary)" fontSize={11} fontWeight={500}>
                    {`${name}: ${value}`}
                  </text>
                )}
                labelLine={{ stroke: 'var(--border-default)', strokeWidth: 1 }}
              >
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} stroke="transparent" />)}
              </Pie>
              <Tooltip contentStyle={getTooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', justifyContent:'center', gap:'1.5rem', marginTop:'0.5rem' }}>
            {ratings.ratingSplit.map((r, i) => (
              <div key={r.rating} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.78rem', color:'var(--text-secondary)' }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:DONUT_COLORS[i], display:'inline-block' }} />
                {r.rating}: {r.count}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Categories Bar + Top Risks Table */}
      <div className="charts-grid">
        <div className="chart-container" id="chart-top-categories">
          <div className="chart-header"><h3>Top Categories by Spend (INR Cr)</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryWise} layout="vertical" margin={{ top: 10, right: 35, left: 15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize:11 }} label={{ value: 'Spend (₹ Cr)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis type="category" dataKey="category" stroke="var(--text-muted)" tick={{ fontSize:11 }} width={75} label={{ value: 'Category', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()} />
              <Bar dataKey="spend" fill="var(--lumax-red)" radius={[0,5,5,0]} name="Spend (Cr)">
                <LabelList dataKey="spend" position="right" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" id="chart-top-risks">
          <div className="chart-header"><h3>Top Supplier Risks</h3></div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Supplier</th><th>Category</th><th>Risk Type</th><th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {exec.topRisks.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{r.supplier}</td>
                    <td>{r.category}</td>
                    <td>{r.riskType}</td>
                    <td>
                      <span className={`badge badge-${r.rating === 'Red' ? 'red' : 'yellow'}`}>{r.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
