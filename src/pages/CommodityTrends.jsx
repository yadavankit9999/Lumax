import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, LabelList
} from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const LINE_COLORS = ['#de0303', '#f59e0b', '#3b82f6', '#14b8a6'];
const FILTERS = [
  { key: 'commodity', label: 'Commodity',   options: ['Copper','Aluminum','Steel'] },
  { key: 'currency',  label: 'Currency',    options: ['USD-INR','EUR-INR'] },
  { key: 'period',    label: 'Time Period', options: ['6M','1Y','FY2026','FY2025'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function CommodityTrends() {
  const [exposure, setExposure]   = useState([]);
  const [trends, setTrends]       = useState(null);
  const [filters, setFilters]     = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/spend/commodity-exposure`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/commodity/trends`).then(r => r.json()),
    ]).then(([e, t]) => { setExposure(e); setTrends(t); }).catch(console.error);
  }, []);

  if (!exposure.length || !trends) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const commodityKpis = exposure.filter(e => e.commodity !== 'Forex USD/INR');
  const forex = exposure.find(e => e.commodity === 'Forex USD/INR');

  // Combine historical + forecast
  const allPriceTrend = [
    ...trends.priceTrend,
    ...trends.forecast.map(f => ({ ...f, isForecast: true })),
  ];

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>LME &amp; Commodity Trends</h2>
          <p>Commodity price tracking, currency exposure, and AI-assisted procurement forecasts.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      {/* KPI Cards */}
      <div className="grid-cards">
        {commodityKpis.map((c, i) => (
          <KpiCard key={c.commodity} id={`kpi-${c.commodity.replace(/\s+/g,'-')}`}
            title={c.commodity.replace('LME ','')}
            value={`${c.currentPrice.toLocaleString()} ${c.unit}`}
            subtext={`₹${c.exposure} Cr exposure`}
            trendValue={`${c.changePercent >= 0 ? '+' : ''}${c.changePercent}%`}
            trend={c.changePercent >= 0 ? 'down' : 'up'}
            icon={c.changePercent >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
            accentColor={c.changePercent >= 0 ? '#ef4444' : '#22c55e'}
          />
        ))}
        {forex && (
          <KpiCard id="kpi-forex" title="USD / INR" value={forex.currentPrice}
            subtext={`₹${forex.exposure} Cr exposure`}
            trendValue={`+${forex.changePercent}%`} trend="down"
            icon={<Zap size={16}/>} accentColor="#8b5cf6"/>
        )}
      </div>

      {/* Commodity Multi-line Trend */}
      <div className="chart-container" id="chart-commodity-trend" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header">
          <h3>Commodity Price Trend (USD/MT)</h3>
          <span style={{fontSize:'0.72rem',color:'var(--accent-teal)',background:'rgba(20,184,166,0.1)',
            padding:'2px 8px',borderRadius:4,border:'1px solid rgba(20,184,166,0.2)'}}>
            Dashed = AI Forecast
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={allPriceTrend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Price (USD/MT)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}
              formatter={(v, name, props) => [
                `${v.toLocaleString()} USD/MT${props.payload.isForecast ? ' (Forecast)' : ''}`, name
              ]}/>
            <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            {['Copper','Aluminum','Steel'].map((c, i) => (
              <Line key={c} type="monotone" dataKey={c} stroke={LINE_COLORS[i]} strokeWidth={2.5}
                strokeDasharray={undefined}
                dot={({ cx, cy, payload }) => (
                  <circle key={`dot-${cx}`} cx={cx} cy={cy} r={payload.isForecast ? 4 : 3}
                    fill={payload.isForecast ? 'none' : LINE_COLORS[i]}
                    stroke={LINE_COLORS[i]} strokeWidth={payload.isForecast ? 2 : 0}
                    strokeDasharray={payload.isForecast ? '4 2' : '0'}/>
                )} activeDot={{r:5}}>
                <LabelList dataKey={c} position="top" offset={8} style={{ fill: LINE_COLORS[i], fontSize: 8, fontWeight: 500 }} />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid">
        {/* Currency Trend */}
        <div className="chart-container" id="chart-forex-trend">
          <div className="chart-header"><h3>USD/INR Trend</h3></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends.forexTrend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} domain={['auto','auto']} width={55} label={{ value: 'Exchange Rate (USD/INR)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }}/>
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Line type="monotone" dataKey="USD_INR" stroke="#8b5cf6" strokeWidth={2.5}
                dot={{r:4,fill:'#8b5cf6',strokeWidth:0}} activeDot={{r:6}} name="USD/INR">
                <LabelList dataKey="USD_INR" position="top" offset={8} style={{ fill: '#8b5cf6', fontSize: 8, fontWeight: 500 }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spend Impact Scatter */}
        <div className="chart-container" id="chart-impact-scatter">
          <div className="chart-header"><h3>Commodity vs Spend Impact</h3></div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{top: 15, right: 25, left: 15, bottom: 15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)"/>
              <XAxis type="number" dataKey="priceChange"  name="Price Change %" stroke="var(--text-muted)" tick={{fontSize:11}} label={{value:'Price Δ%',position:'insideBottom',offset:-5,fill:'var(--text-muted)',fontSize:10}} height={35}/>
              <YAxis type="number" dataKey="spendImpact"  name="Spend Impact Cr" stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{value:'Spend Impact (Cr)',angle:-90,position:'insideLeft',offset:-10,fill:'var(--text-muted)',fontSize:10,style:{textAnchor:'middle'}}}/>
              <ZAxis range={[80,80]}/>
              <Tooltip contentStyle={getTooltipStyle()} cursor={{strokeDasharray:'3 3'}}
                formatter={(v, name) => [name==='Price Change %' ? `${v}%` : `₹${v} Cr`, name]}/>
              <ReferenceLine x={0} stroke="var(--border-default)" strokeWidth={1}/>
              <Scatter data={trends.spendImpact} fill="var(--lumax-red)"
                label={({x, y, width, height, value, index}) => {
                  const d = trends.spendImpact[index];
                  return d ? <text x={x} y={y-10} textAnchor="middle" fill="var(--text-secondary)" fontSize={10}>{d.commodity}</text> : null;
                }}/>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Forecast Panel */}
      <div className="chart-container" id="panel-ai-forecast" style={{marginBottom:'1.5rem',borderColor:'rgba(139,92,246,0.2)'}}>
        <div className="chart-header">
          <h3>AI Forecast &amp; Procurement Recommendations</h3>
          <span style={{fontSize:'0.72rem',color:'#8b5cf6',background:'rgba(139,92,246,0.1)',
            padding:'2px 8px',borderRadius:4,border:'1px solid rgba(139,92,246,0.2)'}}>
            Simulated
          </span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1rem',padding:'0.5rem 0'}}>
          {trends.forecast.map((f, i) => (
            <div key={f.month} className="card" style={{borderColor:'rgba(139,92,246,0.15)'}}>
              <div className="card-title">{f.month} Forecast</div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.3rem',marginTop:'0.5rem'}}>
                {['Copper','Aluminum','Steel'].map((c, j) => (
                  <div key={c} style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem'}}>
                    <span style={{color:'var(--text-muted)'}}>{c}</span>
                    <span style={{fontWeight:600,color:LINE_COLORS[j]}}>{f[c]?.toLocaleString()} USD/MT</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="card" style={{borderColor:'rgba(139,92,246,0.15)',background:'rgba(139,92,246,0.04)'}}>
            <div className="card-title" style={{color:'#8b5cf6'}}>
              <Zap size={14} style={{display:'inline',marginRight:'0.3rem'}}/>
              AI Recommendation
            </div>
            <p style={{fontSize:'0.8rem',color:'var(--text-secondary)',marginTop:'0.5rem',lineHeight:1.5}}>
              Based on upward Copper &amp; Steel trend, consider <strong>forward contracts</strong> for Q3.
              Aluminum shows softening — <strong>defer non-urgent orders</strong> to capture lower prices.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="chart-container" id="panel-commodity-alerts">
        <div className="chart-header"><h3>Price Alerts</h3></div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {trends.alerts.map((a, i) => (
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:'1rem',
              padding:'0.75rem 1rem',borderRadius:'8px',
              background: a.type==='Price Spike' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              border: `1px solid ${a.type==='Price Spike' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            }}>
              {a.type==='Price Spike'
                ? <AlertTriangle size={16} color="#ef4444"/>
                : <TrendingDown size={16} color="#22c55e"/>}
              <div>
                <div style={{fontSize:'0.8rem',fontWeight:700,color:'var(--text-primary)'}}>{a.type} — {a.commodity}</div>
                <div style={{fontSize:'0.78rem',color:'var(--text-secondary)'}}>{a.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
