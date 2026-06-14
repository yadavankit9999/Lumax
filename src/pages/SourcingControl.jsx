import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { Shuffle, Building2, Shield } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const DONUT_COLORS = ['#de0303', '#14b8a6', '#f59e0b'];
const AREA_COLORS  = ['#de0303', '#14b8a6', '#f59e0b'];
const FILTERS = [
  { key: 'entity', label: 'Entity', options: ['Entity A','Entity B','Entity C'] },
  { key: 'plant',  label: 'Plant',  options: ['Gurugram','Pune','Chennai','Manesar'] },
  { key: 'period', label: 'Period', options: ['FY2026','FY2025','Q4 FY26'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function SourcingControl() {
  const [data, setData]       = useState(null);
  const [filters, setFilters] = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/spend/sourcing-control`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const { summary, trend, supplierDistribution, details } = data;
  const donutData = [
    { name: 'Customer Directed', value: summary.customerDirected },
    { name: 'Lumax Controlled',  value: summary.lumaxControlled },
    { name: 'JV Directed',       value: summary.jvDirected },
  ];

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Sourcing Control</h2>
          <p>Understand sourcing control ownership — Customer Directed, Lumax Controlled, JV Directed.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-customer"  title="Customer Directed" value={`₹${summary.customerDirected} Cr`} subtext={`${summary.customerDirectedPct}% of spend`} icon={<Building2 size={16}/>} accentColor="#de0303" />
        <KpiCard id="kpi-lumax"     title="Lumax Controlled"  value={`₹${summary.lumaxControlled} Cr`}  subtext={`${summary.lumaxControlledPct}% of spend`} icon={<Shield size={16}/>}   accentColor="#14b8a6" />
        <KpiCard id="kpi-jv"        title="JV Directed"       value={`₹${summary.jvDirected} Cr`}       subtext={`${summary.jvDirectedPct}% of spend`}    icon={<Shuffle size={16}/>}  accentColor="#f59e0b" />
      </div>

      <div className="charts-grid">
        {/* Donut */}
        <div className="chart-container" id="chart-sourcing-donut">
          <div className="chart-header"><h3>Spend Mix</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}
                label={({ x, y, textAnchor, name, value }) => (
                  <text x={x} y={y} textAnchor={textAnchor} fill="var(--text-primary)" fontSize={11} fontWeight={500}>
                    {`${name}: ₹${value} Cr`}
                  </text>
                )}
                labelLine={{ stroke: 'var(--border-default)', strokeWidth: 1 }}
              >
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} stroke="transparent"/>)}
              </Pie>
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Area */}
        <div className="chart-container" id="chart-sourcing-trend">
          <div className="chart-header"><h3>Trend by Spend Type (INR Cr)</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <defs>
                {AREA_COLORS.map((c, i) => (
                  <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Spend (₹ Cr)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
              {['Customer Directed','Lumax Controlled','JV Directed'].map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} stackId="1"
                  stroke={AREA_COLORS[i]} fill={`url(#grad${i})`} strokeWidth={2}>
                  <LabelList dataKey={key} position="top" offset={8} style={{ fill: AREA_COLORS[i], fontSize: 8, fontWeight: 500 }} />
                </Area>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier distribution bar */}
      <div className="chart-container" id="chart-sourcing-suppliers" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Supplier Count by Sourcing Type</h3></div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={supplierDistribution} margin={{top: 15, right: 15, left: 15, bottom: 15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="type" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Sourcing Control Type', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Suppliers', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Bar dataKey="suppliers" fill="var(--lumax-red)" radius={[5,5,0,0]} name="Suppliers">
              <LabelList dataKey="suppliers" position="top" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail grid */}
      <div className="chart-container" id="table-sourcing-detail">
        <div className="chart-header"><h3>Sourcing Detail Grid</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Type</th><th>Supplier</th><th>Spend (Cr)</th><th>% of Total</th></tr></thead>
            <tbody>
              {details.map((d, i) => (
                <tr key={i}>
                  <td><span className="badge" style={{
                    background: d.type==='Customer Directed' ? 'rgba(222,3,3,0.1)' : d.type==='Lumax Controlled' ? 'rgba(20,184,166,0.1)' : 'rgba(245,158,11,0.1)',
                    color: d.type==='Customer Directed' ? '#de0303' : d.type==='Lumax Controlled' ? '#14b8a6' : '#f59e0b',
                    border: 'none',
                  }}>{d.type}</span></td>
                  <td style={{fontWeight:600}}>{d.supplier}</td>
                  <td>₹{d.spend.toLocaleString('en-IN')}</td>
                  <td>{d.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
