import React, { useEffect, useState, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Line, Legend, LabelList
} from 'recharts';
import { Star, Truck, Award, TrendingUp } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const FILTERS = [
  { key: 'supplier', label: 'Supplier', options: ['Tata Steel','Bosch India','JSW Steel','Motherson'] },
  { key: 'category', label: 'Category', options: ['Raw Materials','Components','Packaging'] },
  { key: 'plant',    label: 'Plant',    options: ['Gurugram','Pune','Chennai','Manesar'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

const RATING_COLOR = { Green: '#22c55e', Yellow: '#f59e0b', Red: '#ef4444' };

const CustomScatterDot = (props) => {
  const { cx, cy, payload } = props;
  const color = RATING_COLOR[payload.rating] || '#de0303';
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.85} stroke={color} strokeWidth={1.5}/>
      <title>{payload.supplier}</title>
    </g>
  );
};

export default function QualityDelivery() {
  const [data, setData]       = useState(null);
  const [filters, setFilters] = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/supplier/quality-delivery`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const { summary, supplierScores, scoreTrend } = data;
  const sorted = [...supplierScores].sort((a, b) => b.total - a.total);

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Quality &amp; Delivery Ratings</h2>
          <p>2D supplier quadrant segmentation by quality and delivery performance.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-quality"  title="Avg Quality Score"  value={`${summary.avgQualityScore}/100`}  subtext="All suppliers" icon={<Star size={16}/>}     accentColor="#22c55e" />
        <KpiCard id="kpi-delivery" title="Avg Delivery Score" value={`${summary.avgDeliveryScore}/100`} subtext="All suppliers" icon={<Truck size={16}/>}    accentColor="#3b82f6" />
        <KpiCard id="kpi-total"    title="Avg Total Score"    value={`${summary.avgTotalScore}/100`}    subtext="Composite"    icon={<Award size={16}/>}     accentColor="#8b5cf6" />
        <KpiCard id="kpi-trend"    title="Score Trend"        value={summary.trend}                     subtext="vs last period" trend="up" icon={<TrendingUp size={16}/>} accentColor="#14b8a6" />
      </div>

      <div className="charts-grid">
        {/* Supplier Quadrant */}
        <div className="chart-container" id="chart-quadrant">
          <div className="chart-header"><h3>Supplier Quadrant (Quality × Delivery)</h3></div>
          <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:'0.5rem',textAlign:'center'}}>
            Top-right = High Quality + High Delivery (Green) &nbsp;·&nbsp; Bottom-left = Poor performers (Red)
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)"/>
              <XAxis type="number" dataKey="quality"  name="Quality Score"  domain={[40,100]} stroke="var(--text-muted)" tick={{fontSize:11}} label={{value:'Quality Score',position:'insideBottom',offset:-5,fill:'var(--text-muted)',fontSize:10}} height={35}/>
              <YAxis type="number" dataKey="delivery" name="Delivery Score" domain={[40,100]} stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{value:'Delivery Score',angle:-90,position:'insideLeft',offset:-10,fill:'var(--text-muted)',fontSize:10,style:{textAnchor:'middle'}}}/>
              <ZAxis range={[100,100]}/>
              <Tooltip contentStyle={getTooltipStyle()} cursor={{strokeDasharray:'3 3'}}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{...getTooltipStyle(),padding:'0.5rem 0.75rem'}}>
                      <div style={{fontWeight:700,marginBottom:4}}>{d.supplier}</div>
                      <div>Quality: <strong>{d.quality}</strong></div>
                      <div>Delivery: <strong>{d.delivery}</strong></div>
                      <div>Total: <strong>{d.total}</strong></div>
                    </div>
                  );
                }}/>
              <ReferenceLine x={75} stroke="var(--border-default)" strokeDasharray="4 4"/>
              <ReferenceLine y={75} stroke="var(--border-default)" strokeDasharray="4 4"/>
              <Scatter data={supplierScores} shape={<CustomScatterDot/>}/>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend */}
        <div className="chart-container" id="chart-score-trend">
          <div className="chart-header"><h3>Quality &amp; Delivery Score Trend</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreTrend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Score', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
              <Line type="monotone" dataKey="Quality"  stroke="#22c55e" strokeWidth={2.5} dot={{r:4,fill:'#22c55e',strokeWidth:0}} activeDot={{r:6}} name="Quality">
                <LabelList dataKey="Quality" position="top" offset={8} style={{ fill: '#22c55e', fontSize: 8, fontWeight: 500 }} />
              </Line>
              <Line type="monotone" dataKey="Delivery" stroke="#3b82f6" strokeWidth={2.5} dot={{r:4,fill:'#3b82f6',strokeWidth:0}} activeDot={{r:6}} name="Delivery">
                <LabelList dataKey="Delivery" position="top" offset={8} style={{ fill: '#3b82f6', fontSize: 8, fontWeight: 500 }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="chart-container" id="table-supplier-ranking" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Top / Bottom Suppliers by Score</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>#</th><th>Supplier</th><th>Quality</th><th>Delivery</th><th>Total</th><th>Rating</th></tr></thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.supplier} style={i >= sorted.length - 2 ? {opacity:0.75} : {}}>
                  <td style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>{i + 1}</td>
                  <td style={{fontWeight:600}}>{s.supplier}</td>
                  <td><span style={{color:'#22c55e',fontWeight:700}}>{s.quality}</span></td>
                  <td><span style={{color:'#3b82f6',fontWeight:700}}>{s.delivery}</span></td>
                  <td style={{fontWeight:800}}>{s.total}</td>
                  <td><span className={`badge badge-${s.rating==='Green'?'green':s.rating==='Yellow'?'yellow':'red'}`}>{s.rating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
