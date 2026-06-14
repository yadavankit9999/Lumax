import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, LabelList
} from 'recharts';
import { Factory, TrendingUp, MapPin, ArrowUpRight } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { feature } from 'topojson-client';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const LINE_COLORS = ['#de0303', '#14b8a6', '#f59e0b', '#8b5cf6'];
const FILTERS = [
  { key: 'period', label: 'Period', options: ['FY2026', 'FY2025', 'Q4 FY26'] },
  { key: 'entity', label: 'Entity', options: ['Entity A', 'Entity B', 'Entity C'] },
  { key: 'plant',  label: 'Plant',  options: ['Gurugram', 'Pune', 'Chennai', 'Manesar'] },
];
const PLANT_COORDS = {
  Gurugram: [77.0266, 28.4595],
  Pune:     [73.8567, 18.5204],
  Chennai:  [80.2707, 13.0827],
  Manesar:  [76.9204, 28.3516],
};

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function PlantWiseSpend() {
  const [plants, setPlants]   = useState([]);
  const [trend, setTrend]     = useState([]);
  const [filters, setFilters] = useState({});
  const [geoData, setGeoData] = useState(null);
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/spend/plant-wise`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/spend/plant-trend`).then(r => r.json()),
      fetch('/india.json').then(r => r.json()),
    ]).then(([p, t, topo]) => {
      setPlants(p);
      setTrend(t);
      setGeoData(feature(topo, topo.objects.states));
    }).catch(console.error);
  }, []);

  if (!plants.length || !geoData) return <div className="loading-state"><div className="loading-spinner" /><p>Loading…</p></div>;

  const maxSpend   = Math.max(...plants.map(p => p.spend));
  const topPlant   = plants.reduce((a, b) => (a.spend > b.spend ? a : b));
  const totalSpend = plants.reduce((s, p) => s + p.spend, 0);
  const avgGrowth  = (plants.reduce((s, p) => s + p.yoyGrowth, 0) / plants.length).toFixed(1);

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent" />Plant-wise Spend</h2>
          <p>Spend distribution, ranking and trends across manufacturing plants.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-total-spend"  title="Total Spend"          value={`₹${totalSpend.toLocaleString('en-IN')} Cr`} subtext="All plants combined" icon={<Factory size={16}/>} />
        <KpiCard id="kpi-plant-count"  title="# Plants"             value={plants.length}        subtext="Active plants" icon={<MapPin size={16}/>} />
        <KpiCard id="kpi-top-plant"    title="Highest Spend Plant"   value={topPlant.plant}       subtext={`₹${topPlant.spend} Cr`} icon={<ArrowUpRight size={16}/>} accentColor="#de0303" />
        <KpiCard id="kpi-avg-growth"   title="Avg. Growth %"        value={`+${avgGrowth}%`}     subtext="YoY across plants" trend="up" icon={<TrendingUp size={16}/>} accentColor="#22c55e" />
      </div>

      {/* India Plant Map (SVG) + Horizontal Ranking */}
      <div className="charts-grid">
        <div className="chart-container" id="chart-india-map" style={{ minHeight: '430px' }}>
          <div className="chart-header"><h3>India Plant Map</h3></div>
          <div style={{ display: 'flex', justifyContent: 'center', height: '360px' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 555,
                center: [78.9629, 21.3]
              }}
              width={290}
              height={360}
              style={{ width: '100%', height: '100%' }}
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: 'var(--bg-elevated)',
                          stroke: 'var(--border-default)',
                          strokeWidth: 0.5,
                          outline: 'none',
                          transition: 'fill 0.2s ease'
                        },
                        hover: {
                          fill: 'var(--bg-card-hover)',
                          stroke: 'var(--border-accent)',
                          strokeWidth: 0.8,
                          outline: 'none'
                        },
                        pressed: {
                          fill: 'var(--bg-card-hover)',
                          stroke: 'var(--border-accent)',
                          strokeWidth: 0.8,
                          outline: 'none'
                        }
                      }}
                    />
                  ))
                }
              </Geographies>
              {plants.map((plant) => {
                const coords = PLANT_COORDS[plant.plant];
                if (!coords) return null;
                const r = 4 + (plant.spend / maxSpend) * 10;
                
                // Adjust label position depending on plant name to prevent overlapping
                let labelY = r + 8;
                let labelX = 0;
                if (plant.plant === 'Gurugram') {
                  labelY = -r - 12;
                  labelX = 5;
                } else if (plant.plant === 'Manesar') {
                  labelY = r + 8;
                  labelX = -12;
                }

                return (
                  <Marker key={plant.plant} coordinates={coords}>
                    <circle r={r + 3} fill="var(--lumax-red)" opacity={0.15} />
                    <circle r={r} fill="var(--lumax-red)" opacity={0.75} />
                    <circle r={r} fill="none" stroke="var(--lumax-red)" strokeWidth={1} opacity={0.4} />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fontSize={8}
                      fill="var(--text-secondary)"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {plant.plant}
                    </text>
                    <text
                      x={labelX}
                      y={labelY + 9}
                      textAnchor="middle"
                      fontSize={7}
                      fill="var(--text-muted)"
                      fontWeight={700}
                      style={{ pointerEvents: 'none' }}
                    >
                      ₹{plant.spend}Cr
                    </text>
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>
        </div>

        <div className="chart-container" id="chart-plant-ranking">
          <div className="chart-header"><h3>Plant Spend Ranking (INR Cr)</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[...plants].sort((a,b) => b.spend - a.spend)} layout="vertical" margin={{ top: 10, right: 35, left: 15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize:11 }} label={{ value: 'Spend (₹ Cr)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis type="category" dataKey="plant" stroke="var(--text-muted)" tick={{ fontSize:11 }} width={75} label={{ value: 'Plant', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()} />
              <Bar dataKey="spend" fill="var(--lumax-red)" radius={[0,5,5,0]} name="Spend (Cr)">
                <LabelList dataKey="spend" position="right" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend by Plant */}
      <div className="chart-container" id="chart-plant-trend" style={{ marginBottom:'1.5rem' }}>
        <div className="chart-header"><h3>Monthly Spend Trend by Plant (INR Cr)</h3></div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend} margin={{ top: 15, right: 25, left: 15, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize:11 }} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize:11 }} width={55} label={{ value: 'Spend (₹ Cr)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()} />
            <Legend wrapperStyle={{ fontSize:'0.78rem' }} />
            {plants.map((p, i) => (
              <Line key={p.plant} type="monotone" dataKey={p.plant} stroke={LINE_COLORS[i]} strokeWidth={2}
                dot={{ r:3, fill:LINE_COLORS[i], strokeWidth:0 }} activeDot={{ r:5 }}>
                <LabelList dataKey={p.plant} position="top" offset={8} style={{ fill: LINE_COLORS[i], fontSize: 8, fontWeight: 500 }} />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Table */}
      <div className="chart-container" id="table-plant-detail">
        <div className="chart-header"><h3>Plant Detail</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Plant</th><th>Spend (Cr)</th><th>% Share</th><th>YoY Growth</th></tr></thead>
            <tbody>
              {plants.map(p => (
                <tr key={p.plant}>
                  <td style={{ fontWeight:600 }}>{p.plant}</td>
                  <td>₹{p.spend.toLocaleString('en-IN')}</td>
                  <td>{p.share}%</td>
                  <td><span className={p.yoyGrowth >= 0 ? 'trend-up' : 'trend-down'}>
                    {p.yoyGrowth >= 0 ? '+' : ''}{p.yoyGrowth}%
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
