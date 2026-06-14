import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ComposedChart, Area, LabelList
} from 'recharts';
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const FILTERS = [
  { key: 'supplier', label: 'Supplier', options: ['Tata Steel','Bosch India','JSW Steel','Motherson'] },
  { key: 'category', label: 'Category', options: ['Raw Materials','Components','Packaging'] },
  { key: 'plant',    label: 'Plant',    options: ['Gurugram','Pune','Chennai','Manesar'] },
  { key: 'period',   label: 'Period',   options: ['FY2026','FY2025','Q4 FY26'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function SupplierWiseSpend() {
  const [data, setData]       = useState(null);
  const [filters, setFilters] = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/spend/supplier-wise`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const { summary, topSuppliers, trend } = data;

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Supplier-wise Spend</h2>
          <p>Supplier concentration, Pareto analysis, and spend trends.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-total-sup"  title="Total Suppliers"    value={summary.totalSuppliers}   subtext="Across all plants" icon={<Users size={16}/>} />
        <KpiCard id="kpi-active-sup" title="Active Suppliers"   value={summary.activeSuppliers}  subtext="Transacted in period" icon={<UserCheck size={16}/>} accentColor="#22c55e" />
        <KpiCard id="kpi-new-sup"    title="New Suppliers"      value={summary.newSuppliers}     subtext="Added this period" icon={<UserPlus size={16}/>} accentColor="#3b82f6" />
        <KpiCard id="kpi-inactive"   title="Inactive Suppliers" value={summary.inactiveSuppliers} subtext="No transactions" icon={<UserX size={16}/>} accentColor="#6b7280" />
      </div>

      {/* Top 20 bar */}
      <div className="chart-container" id="chart-supplier-ranking" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Top 10 Supplier Ranking (INR Cr)</h3></div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topSuppliers} layout="vertical" margin={{top: 10, right: 35, left: 15, bottom: 10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false}/>
            <XAxis type="number" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Spend (₹ Cr)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis type="category" dataKey="supplier" stroke="var(--text-muted)" tick={{fontSize:11}} width={85} label={{ value: 'Supplier', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Bar dataKey="spend" fill="var(--lumax-red)" radius={[0,5,5,0]} name="Spend (Cr)">
              <LabelList dataKey="spend" position="right" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pareto 80/20 */}
      <div className="chart-container" id="chart-pareto" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header">
          <h3>Supplier Spend Concentration — Pareto 80/20</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={topSuppliers} margin={{top: 15, right: 35, left: 15, bottom: 15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="supplier" stroke="var(--text-muted)" tick={{fontSize:10}} angle={-20} textAnchor="end" height={60} label={{ value: 'Supplier', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }}/>
            <YAxis yAxisId="left"  stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Spend (₹ Cr)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }}/>
            <YAxis yAxisId="right" orientation="right" stroke="var(--accent-teal)" tick={{fontSize:11}} domain={[0,100]} unit="%" width={55} label={{ value: 'Cumulative Spend %', angle: 90, position: 'insideRight', offset: -10, fill: 'var(--accent-teal)', fontSize: 10, style: { textAnchor: 'middle' } }}/>
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            <Bar yAxisId="left"  dataKey="spend"      fill="var(--lumax-red)" radius={[4,4,0,0]} name="Spend (Cr)">
              <LabelList dataKey="spend" position="top" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="var(--accent-teal)"
              strokeWidth={2.5} dot={{r:4,fill:'var(--accent-teal)',strokeWidth:0}} name="Cumulative %">
              <LabelList dataKey="cumulative" position="top" offset={8} formatter={(val) => `${val}%`} style={{ fill: 'var(--accent-teal)', fontSize: 8, fontWeight: 500 }} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
        {/* 80% reference annotation */}
        <div style={{textAlign:'center',fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.25rem'}}>
          ← Suppliers below 80% cumulative represent the critical base
        </div>
      </div>

      {/* Trend */}
      <div className="chart-container" id="chart-supplier-trend" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Monthly Spend Trend (INR Cr)</h3></div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Spend (₹ Cr)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            <Line type="monotone" dataKey="topTen" stroke="var(--lumax-red)"    strokeWidth={2} name="Top 10 Suppliers" dot={{r:3,strokeWidth:0}}>
              <LabelList dataKey="topTen" position="top" offset={8} style={{ fill: 'var(--lumax-red)', fontSize: 8, fontWeight: 500 }} />
            </Line>
            <Line type="monotone" dataKey="others"  stroke="var(--accent-teal)" strokeWidth={2} name="Others"           dot={{r:3,strokeWidth:0}}>
              <LabelList dataKey="others" position="top" offset={8} style={{ fill: 'var(--accent-teal)', fontSize: 8, fontWeight: 500 }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Supplier detail grid */}
      <div className="chart-container" id="table-supplier-detail">
        <div className="chart-header"><h3>Supplier Detail Grid</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Supplier</th><th>Spend (Cr)</th><th>Share %</th><th>YoY</th><th>Payment Terms</th><th>Type</th></tr></thead>
            <tbody>
              {topSuppliers.map(s => (
                <tr key={s.supplier}>
                  <td style={{fontWeight:600}}>{s.supplier}</td>
                  <td>₹{s.spend.toLocaleString('en-IN')}</td>
                  <td>{s.share}%</td>
                  <td><span className={s.yoyChange>=0?'trend-up':'trend-down'}>{s.yoyChange>=0?'+':''}{s.yoyChange}%</span></td>
                  <td>{s.paymentTerms}</td>
                  <td><span className="badge" style={{background:'var(--blue-bg)',color:'var(--blue)',border:'1px solid var(--blue-bg)'}}>{s.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
