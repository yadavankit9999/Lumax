import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, LabelList
} from 'recharts';
import { ShieldCheck, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const DONUT_COLORS  = ['#22c55e', '#f59e0b', '#ef4444'];
const AREA_COLORS   = ['#22c55e', '#f59e0b', '#ef4444'];
const FILTERS = [
  { key: 'plant',    label: 'Plant',    options: ['Gurugram','Pune','Chennai','Manesar'] },
  { key: 'supplier', label: 'Supplier', options: ['Tata Steel','Bosch India','Alpha Parts'] },
  { key: 'category', label: 'Category', options: ['Raw Materials','Components','Packaging'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function SupplierPerformance() {
  const [ratings, setRatings]     = useState(null);
  const [plantLevel, setPlant]    = useState([]);
  const [ratingTrend, setTrend]   = useState([]);
  const [filters, setFilters]     = useState({});

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/supplier/ratings`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/supplier/plant-level`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/supplier/rating-trend`).then(r => r.json()),
    ]).then(([rt, pl, tr]) => { setRatings(rt); setPlant(pl); setTrend(tr); }).catch(console.error);
  }, []);

  if (!ratings) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const green  = ratings.ratingSplit.find(r => r.rating === 'Green')  || {};
  const yellow = ratings.ratingSplit.find(r => r.rating === 'Yellow') || {};
  const red    = ratings.ratingSplit.find(r => r.rating === 'Red')    || {};
  const donutData = ratings.ratingSplit.map(r => ({ name: r.rating, value: r.count }));

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Supplier Ratings Overview</h2>
          <p>Quality, delivery, and compliance tracking across the supply base.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={(k,v) => setFilters(f=>({...f,[k]:v}))} />

      {/* KPI Cards */}
      <div className="grid-cards">
        <KpiCard id="kpi-green"   title="Green Suppliers"  value={green.count}                  subtext={`${green.percentage}% of base`}  icon={<ShieldCheck size={16}/>}  accentColor="#22c55e" />
        <KpiCard id="kpi-yellow"  title="Yellow Suppliers" value={yellow.count}                 subtext={`${yellow.percentage}% of base`} icon={<AlertTriangle size={16}/>} accentColor="#f59e0b" />
        <KpiCard id="kpi-red"     title="Red Suppliers"    value={red.count}                    subtext={`${red.percentage}% of base`}    icon={<XCircle size={16}/>}       accentColor="#ef4444" />
        <KpiCard id="kpi-chronic" title="Chronic Red"      value={ratings.chronicRedSuppliers}  subtext="3+ months in Red"                icon={<AlertCircle size={16}/>}   accentColor="#b91c1c" />
      </div>

      <div className="charts-grid">
        {/* Supplier Health Donut */}
        <div className="chart-container" id="chart-health-donut">
          <div className="chart-header"><h3>Supplier Health Distribution</h3></div>
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
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} stroke="transparent"/>)}
              </Pie>
              <Tooltip contentStyle={getTooltipStyle()} />
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Rating Trend — Stacked Area */}
        <div className="chart-container" id="chart-rating-trend">
          <div className="chart-header"><h3>Monthly Rating Trend</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={ratingTrend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <defs>
                {AREA_COLORS.map((c,i) => (
                  <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Supplier Count', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
              {['Green','Yellow','Red'].map((k, i) => (
                <Area key={k} type="monotone" dataKey={k} stackId="1"
                  stroke={AREA_COLORS[i]} fill={`url(#grad${i})`} strokeWidth={2}>
                  <LabelList dataKey={k} position="top" offset={8} style={{ fill: AREA_COLORS[i], fontSize: 8, fontWeight: 500 }} />
                </Area>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plant-level Stacked Bar */}
      <div className="chart-container" id="chart-plant-rating" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Plant-level Supplier Rating Breakdown (%)</h3></div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={plantLevel} margin={{top: 15, right: 15, left: 15, bottom: 15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="plant" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Plant', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            <Bar dataKey="Green"  stackId="a" fill="#22c55e" name="Green">
              <LabelList dataKey="Green" position="inside" formatter={(val) => `${val}%`} style={{ fill: '#fff', fontSize: 10, fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="Yellow" stackId="a" fill="#f59e0b" name="Yellow">
              <LabelList dataKey="Yellow" position="inside" formatter={(val) => `${val}%`} style={{ fill: '#fff', fontSize: 10, fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="Red"    stackId="a" fill="#ef4444" radius={[4,4,0,0]} name="Red">
              <LabelList dataKey="Red" position="inside" formatter={(val) => `${val}%`} style={{ fill: '#fff', fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Supplier Health Matrix — Heatmap table */}
      <div className="chart-container" id="chart-health-matrix" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Supplier Health Matrix (Plant × Month)</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Plant</th>
                {ratingTrend.map(t => <th key={t.month}>{t.month}</th>)}
              </tr>
            </thead>
            <tbody>
              {plantLevel.map(p => (
                <tr key={p.plant}>
                  <td style={{fontWeight:600}}>{p.plant}</td>
                  {ratingTrend.map((t, i) => {
                    const pct = p.Green + (i * (p.Green > 70 ? 0.5 : 0.3));
                    const color = pct >= 70 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#ef4444';
                    return (
                      <td key={t.month} style={{textAlign:'center',background:`${color}18`,color,fontWeight:700,fontSize:'0.78rem'}}>
                        {Math.round(pct)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Suppliers */}
      <div className="chart-container" id="table-critical-suppliers">
        <div className="chart-header"><h3>Critical Suppliers</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Supplier</th><th>Plant</th><th>Rating</th><th>Months in Red</th></tr></thead>
            <tbody>
              {ratings.criticalSuppliers.map(s => (
                <tr key={s.supplier}>
                  <td style={{fontWeight:600}}>{s.supplier}</td>
                  <td>{s.plant}</td>
                  <td><span className={`badge badge-${s.rating === 'Red' ? 'red' : 'yellow'}`}>{s.rating}</span></td>
                  <td style={{color: s.monthsInRed >= 4 ? '#ef4444' : '#f59e0b', fontWeight:700}}>{s.monthsInRed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
