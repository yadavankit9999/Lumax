import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { Globe, Package, Truck, Percent } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const DONUT_COLORS = ['#de0303', '#14b8a6'];
const FILTERS = [
  { key: 'country',  label: 'Country',  options: ['China','Germany','Japan','South Korea','USA','Taiwan'] },
  { key: 'supplier', label: 'Supplier', options: ['Tata Steel','Bosch India','JSW Steel'] },
  { key: 'plant',    label: 'Plant',    options: ['Gurugram','Pune','Chennai','Manesar'] },
  { key: 'period',   label: 'Period',   options: ['FY2026','FY2025','Q4 FY26'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

export default function ImportDomestic() {
  const [data, setData]       = useState(null);
  const [filters, setFilters] = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/spend/import-domestic`)
      .then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const { summary, countryRanking, trend } = data;
  const donutData = [
    { name: 'Import',   value: summary.importSpend },
    { name: 'Domestic', value: summary.domesticSpend },
  ];

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Import vs Domestic Spend</h2>
          <p>Country-wise import analysis and domestic vs import spend breakdown.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-import"   title="Import Spend"    value={`₹${summary.importSpend} Cr`}   subtext="Foreign sourcing" icon={<Globe size={16}/>} accentColor="#de0303" />
        <KpiCard id="kpi-domestic" title="Domestic Spend"  value={`₹${summary.domesticSpend} Cr`} subtext="India sourcing"   icon={<Package size={16}/>} accentColor="#14b8a6" />
        <KpiCard id="kpi-imp-pct"  title="Import %"        value={`${summary.importPct}%`}         subtext="Of total spend"  icon={<Percent size={16}/>} />
        <KpiCard id="kpi-countries" title="# Countries"    value={summary.countries}               subtext="Import origins"  icon={<Truck size={16}/>} accentColor="#8b5cf6" />
      </div>

      <div className="charts-grid">
        {/* Donut */}
        <div className="chart-container" id="chart-import-donut">
          <div className="chart-header"><h3>Import vs Domestic</h3></div>
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

        {/* Country Ranking Bar */}
        <div className="chart-container" id="chart-country-ranking">
          <div className="chart-header"><h3>Country-wise Import Ranking (INR Cr)</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryRanking} layout="vertical" margin={{top: 10, right: 35, left: 15, bottom: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false}/>
              <XAxis type="number" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Spend (₹ Cr)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis type="category" dataKey="country" stroke="var(--text-muted)" tick={{fontSize:11}} width={90}
                tickFormatter={(v) => {
                  const item = countryRanking.find(c => c.country === v);
                  return item ? `${item.flag} ${v}` : v;
                }} label={{ value: 'Country', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Bar dataKey="spend" fill="var(--lumax-red)" radius={[0,5,5,0]} name="Spend (Cr)">
                <LabelList dataKey="spend" position="right" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area trend */}
      <div className="chart-container" id="chart-import-trend" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Import vs Domestic Trend (INR Cr)</h3></div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
            <defs>
              <linearGradient id="gradImport"   x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#de0303" stopOpacity={0.3}/><stop offset="95%" stopColor="#de0303" stopOpacity={0}/></linearGradient>
              <linearGradient id="gradDomestic" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Spend (₹ Cr)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            <Area type="monotone" dataKey="Import"   stroke="#de0303" fill="url(#gradImport)"   strokeWidth={2} name="Import">
              <LabelList dataKey="Import" position="top" offset={8} style={{ fill: '#de0303', fontSize: 8, fontWeight: 500 }} />
            </Area>
            <Area type="monotone" dataKey="Domestic" stroke="#14b8a6" fill="url(#gradDomestic)" strokeWidth={2} name="Domestic">
              <LabelList dataKey="Domestic" position="top" offset={8} style={{ fill: '#14b8a6', fontSize: 8, fontWeight: 500 }} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Country detail grid */}
      <div className="chart-container" id="table-country-detail">
        <div className="chart-header"><h3>Country Detail Grid</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Country</th><th>Spend (Cr)</th><th>Supplier Count</th></tr></thead>
            <tbody>
              {countryRanking.map(c => (
                <tr key={c.country}>
                  <td style={{fontWeight:600}}>{c.flag} {c.country}</td>
                  <td>₹{c.spend.toLocaleString('en-IN')}</td>
                  <td>{c.supplierCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
