import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { MapPin, ShieldCheck, AlertTriangle, XCircle, Activity } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const LINE_COLORS = ['#de0303', '#14b8a6', '#f59e0b', '#8b5cf6'];
const FILTERS = [
  { key: 'plant',  label: 'Plant',  options: ['Gurugram','Pune','Chennai','Manesar'] },
  { key: 'period', label: 'Period', options: ['FY2026','FY2025','Q4 FY26'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function PlantRating() {
  const [plants, setPlants] = useState([]);
  const [trend, setTrend]   = useState([]);
  const [filters, setFilters] = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/supplier/plant-level`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/supplier/plant-rating-trend`).then(r => r.json()),
    ]).then(([p, t]) => { setPlants(p); setTrend(t); }).catch(console.error);
  }, []);

  if (!plants.length) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const avgGreen  = (plants.reduce((s, p) => s + p.Green,  0) / plants.length).toFixed(1);
  const avgYellow = (plants.reduce((s, p) => s + p.Yellow, 0) / plants.length).toFixed(1);
  const avgRed    = (plants.reduce((s, p) => s + p.Red,    0) / plants.length).toFixed(1);
  const riskScore = ((parseFloat(avgYellow) * 0.5 + parseFloat(avgRed)) / 100 * 10).toFixed(1);

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Plant-Level Supplier Rating</h2>
          <p>Green/Yellow/Red rating breakdown and risk score by plant.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-green-pct"  title="Avg Green %"   value={`${avgGreen}%`}   subtext="Across all plants" icon={<ShieldCheck size={16}/>}  accentColor="#22c55e" />
        <KpiCard id="kpi-yellow-pct" title="Avg Yellow %"  value={`${avgYellow}%`}  subtext="Watch list"        icon={<AlertTriangle size={16}/>} accentColor="#f59e0b" />
        <KpiCard id="kpi-red-pct"    title="Avg Red %"     value={`${avgRed}%`}     subtext="Critical zone"     icon={<XCircle size={16}/>}       accentColor="#ef4444" />
        <KpiCard id="kpi-risk"       title="Risk Score"    value={`${riskScore}/10`} subtext="Composite score"  icon={<Activity size={16}/>}      accentColor="#8b5cf6" />
      </div>

      {/* Plant Heat Map Grid */}
      <div className="chart-container" id="chart-plant-heatmap" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Plant Heat Map (G/Y/R by Plant)</h3></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
          {plants.map((p) => {
            const overall = p.Green >= 70 ? 'green' : p.Green >= 55 ? 'yellow' : 'red';
            const color   = overall === 'green' ? '#22c55e' : overall === 'yellow' ? '#f59e0b' : '#ef4444';
            return (
              <div key={p.plant} className="card" style={{borderColor:`${color}40`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                  <div className="card-title" style={{margin:0}}><MapPin size={14} style={{display:'inline',marginRight:4}}/>{p.plant}</div>
                  <span style={{fontSize:'0.7rem',fontWeight:700,padding:'2px 8px',borderRadius:4,background:`${color}18`,color}}>{overall.toUpperCase()}</span>
                </div>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  {[['G', p.Green, '#22c55e'], ['Y', p.Yellow, '#f59e0b'], ['R', p.Red, '#ef4444']].map(([l, v, c]) => (
                    <div key={l} style={{flex:1,textAlign:'center',background:`${c}10`,borderRadius:6,padding:'0.5rem',border:`1px solid ${c}25`}}>
                      <div style={{fontSize:'0.65rem',color,fontWeight:700}}>{l}</div>
                      <div style={{fontSize:'1.1rem',fontWeight:800,color}}>{v}%</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="charts-grid">
        {/* Plant Comparison Stacked Bar */}
        <div className="chart-container" id="chart-plant-comparison">
          <div className="chart-header"><h3>Plant Comparison (Stacked Bar)</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={plants} margin={{top: 15, right: 15, left: 15, bottom: 15}}>
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

        {/* Trend by Plant — Green % */}
        <div className="chart-container" id="chart-plant-trend">
          <div className="chart-header"><h3>Green % Trend by Plant</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} domain={[40,90]} unit="%" width={55} label={{ value: 'Green Rating %', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }}/>
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
              {plants.map((p, i) => (
                <Line key={p.plant} type="monotone" dataKey={p.plant} stroke={LINE_COLORS[i]}
                  strokeWidth={2} dot={{r:3,strokeWidth:0}} activeDot={{r:5}} name={p.plant}>
                  <LabelList dataKey={p.plant} position="top" offset={8} formatter={(val) => `${val}%`} style={{ fill: LINE_COLORS[i], fontSize: 8, fontWeight: 500 }} />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plant Details Table */}
      <div className="chart-container" id="table-plant-details">
        <div className="chart-header"><h3>Plant Details</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Plant</th><th>Green %</th><th>Yellow %</th><th>Red %</th><th>Overall</th></tr></thead>
            <tbody>
              {plants.map(p => {
                const overall = p.Green >= 70 ? 'Green' : p.Green >= 55 ? 'Yellow' : 'Red';
                return (
                  <tr key={p.plant}>
                    <td style={{fontWeight:600}}>{p.plant}</td>
                    <td style={{color:'#22c55e',fontWeight:700}}>{p.Green}%</td>
                    <td style={{color:'#f59e0b',fontWeight:700}}>{p.Yellow}%</td>
                    <td style={{color:'#ef4444',fontWeight:700}}>{p.Red}%</td>
                    <td><span className={`badge badge-${overall === 'Green' ? 'green' : overall === 'Yellow' ? 'yellow' : 'red'}`}>{overall}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
