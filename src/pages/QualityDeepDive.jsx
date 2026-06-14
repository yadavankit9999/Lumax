import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { Activity, AlertOctagon, XOctagon, TrendingDown } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const FILTERS = [
  { key: 'supplier', label: 'Supplier', options: ['Alpha Parts','Beta Metals','Tata Steel','Bosch India'] },
  { key: 'part',     label: 'Part',     options: ['Bracket-A12','Housing-B07','Cover-G04'] },
  { key: 'plant',    label: 'Plant',    options: ['Gurugram','Pune','Chennai','Manesar'] },
];

const HEAT_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function QualityDeepDive() {
  const [quality, setQuality]   = useState(null);
  const [defects, setDefects]   = useState(null);
  const [filters, setFilters]   = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/supplier/quality-deep-dive`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/supplier/defects`).then(r => r.json()),
    ]).then(([q, d]) => { setQuality(q); setDefects(d); }).catch(console.error);
  }, []);

  if (!quality || !defects) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  // Build Pareto cumulative
  let cumulative = 0;
  const total = defects.defectCategories.reduce((s, d) => s + d.count, 0);
  const paretoData = defects.defectCategories.map(d => {
    cumulative += d.count;
    return { ...d, cumPct: Math.round(cumulative / total * 100) };
  });

  const heatmapSuppliers = defects.heatmap.length > 0 ? Object.keys(defects.heatmap[0]).filter(k => k !== 'plant') : [];

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Quality Score Deep Dive</h2>
          <p>PPM trend, defect Pareto, supplier comparison, and quality heatmap.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-ppm"         title="Avg PPM"         value={defects.summary.avgPpm.toLocaleString()} subtext="Parts per million" icon={<Activity size={16}/>} accentColor="#ef4444" />
        <KpiCard id="kpi-rej-pct"     title="Rejection %"     value={`${defects.summary.rejectionPct}%`}      subtext="Of total receipts" icon={<AlertOctagon size={16}/>} accentColor="#f59e0b" />
        <KpiCard id="kpi-defect-count" title="Defect Count"   value={defects.summary.defectCount.toLocaleString()} subtext="This period"   icon={<XOctagon size={16}/>} accentColor="#b91c1c" />
        <KpiCard id="kpi-trend"       title="PPM Trend"       value={defects.summary.trend}                   subtext="vs last period"   trend="up" icon={<TrendingDown size={16}/>} accentColor="#22c55e" />
      </div>

      <div className="charts-grid">
        {/* PPM Trend */}
        <div className="chart-container" id="chart-ppm-trend">
          <div className="chart-header"><h3>PPM Trend</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={quality.ppmTrend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'PPM', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Line type="monotone" dataKey="ppm" stroke="var(--lumax-red)" strokeWidth={2.5}
                dot={{r:4,fill:'var(--lumax-red)',strokeWidth:0}} activeDot={{r:6}} name="PPM">
                <LabelList dataKey="ppm" position="top" offset={8} style={{ fill: 'var(--lumax-red)', fontSize: 8, fontWeight: 500 }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Defect Pareto */}
        <div className="chart-container" id="chart-defect-pareto">
          <div className="chart-header"><h3>Defect Category Pareto</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={paretoData} margin={{top: 15, right: 35, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="category" stroke="var(--text-muted)" tick={{fontSize:10}} angle={-15} textAnchor="end" height={60} label={{ value: 'Defect Category', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }}/>
              <YAxis yAxisId="left"  stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Defect Count', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }}/>
              <YAxis yAxisId="right" orientation="right" stroke="var(--accent-teal)" tick={{fontSize:11}} domain={[0,100]} unit="%" width={55} label={{ value: 'Cumulative Defect %', angle: 90, position: 'insideRight', offset: -10, fill: 'var(--accent-teal)', fontSize: 10, style: { textAnchor: 'middle' } }}/>
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
              <Bar    yAxisId="left"  dataKey="count"  fill="var(--lumax-red)" radius={[4,4,0,0]} name="Count">
                <LabelList dataKey="count" position="top" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
              </Bar>
              <Line   yAxisId="right" type="monotone" dataKey="cumPct" stroke="var(--accent-teal)" strokeWidth={2.5}
                dot={{r:4,fill:'var(--accent-teal)',strokeWidth:0}} name="Cumulative %">
                <LabelList dataKey="cumPct" position="top" offset={8} formatter={(val) => `${val}%`} style={{ fill: 'var(--accent-teal)', fontSize: 8, fontWeight: 500 }} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Quality Comparison Bar */}
      <div className="chart-container" id="chart-supplier-quality" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Supplier Quality Comparison (PPM)</h3></div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={defects.supplierComparison} layout="vertical" margin={{top: 10, right: 35, left: 15, bottom: 10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false}/>
            <XAxis type="number" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'PPM', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis type="category" dataKey="supplier" stroke="var(--text-muted)" tick={{fontSize:11}} width={85} label={{ value: 'Supplier', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Bar dataKey="ppm" radius={[0,5,5,0]} name="PPM" fill="var(--lumax-red)">
              <LabelList dataKey="ppm" position="right" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quality Heatmap */}
      <div className="chart-container" id="chart-quality-heatmap" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Quality Heatmap (Plant × Supplier)</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Plant</th>
                {heatmapSuppliers.map(s => <th key={s}>{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {defects.heatmap.map(row => (
                <tr key={row.plant}>
                  <td style={{fontWeight:600}}>{row.plant}</td>
                  {heatmapSuppliers.map(s => {
                    const level = row[s] || 'low';
                    const c = HEAT_COLOR[level];
                    return (
                      <td key={s} style={{textAlign:'center',background:`${c}18`,color:c,fontWeight:700,fontSize:'0.78rem',textTransform:'capitalize'}}>
                        {level}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defect Detail Table */}
      <div className="chart-container" id="table-defect-detail">
        <div className="chart-header"><h3>Defect Detail Table</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Supplier</th><th>Part</th><th>PPM</th><th>Rejections</th><th>Corrective Action</th></tr></thead>
            <tbody>
              {defects.defectDetails.map((d, i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{d.supplier}</td>
                  <td style={{fontFamily:'var(--font-mono)',fontSize:'0.78rem'}}>{d.part}</td>
                  <td style={{color: d.ppm > 3000 ? '#ef4444' : d.ppm > 2000 ? '#f59e0b' : '#22c55e', fontWeight:700}}>{d.ppm.toLocaleString()}</td>
                  <td>{d.rejections}</td>
                  <td><span className="badge" style={{background:'var(--blue-bg)',color:'var(--blue)',border:'1px solid var(--blue-bg)'}}>{d.action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
