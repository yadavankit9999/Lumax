import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Treemap, LabelList
} from 'recharts';
import { Tag, TrendingUp, BarChart2 } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import KpiCard   from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const CAT_COLORS  = ['#de0303', '#14b8a6', '#f59e0b'];
const TREEMAP_COLORS = ['#de0303','#b30202','#8b0000','#14b8a6','#0d9488','#f59e0b'];

const FILTERS = [
  { key: 'category',    label: 'Category',     options: ['Raw Materials','Components','Packaging'] },
  { key: 'subcategory', label: 'Sub-category',  options: ['Steel','Aluminum','Copper','Electronics','Plastics'] },
  { key: 'period',      label: 'Period',        options: ['FY2026','FY2025','Q4 FY26'] },
];

const getTooltipStyle = () => ({
  backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1d2229',
  border: `1px solid ${document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
  color: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#f4f6f9',
});

const formatCurrency = (value) => Number(value || 0).toLocaleString('en-IN');

const CustomCell = ({ x, y, width, height, name, value, size, spend, index }) => {
  if (width < 35 || height < 25) return null;

  const amount = value ?? size ?? spend ?? 0;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={TREEMAP_COLORS[index % TREEMAP_COLORS.length]} rx={4}/>
      <text x={x+width/2} y={y+height/2-6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{name}</text>
      <text x={x+width/2} y={y+height/2+10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10}>₹{formatCurrency(amount)} Cr</text>
    </g>
  );
};

export default function CategoryWiseSpend() {
  const [categories, setCategories] = useState([]);
  const [trend, setTrend]           = useState([]);
  const [matrix, setMatrix]         = useState(null);
  const [filters, setFilters]       = useState({});
  const handleFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/spend/category-wise`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/spend/category-trend`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/spend/supplier-category-matrix`).then(r => r.json()),
    ]).then(([c, t, m]) => { setCategories(c); setTrend(t); setMatrix(m); }).catch(console.error);
  }, []);

  if (!categories.length) return <div className="loading-state"><div className="loading-spinner"/><p>Loading…</p></div>;

  const totalSpend = categories.reduce((s, c) => s + c.spend, 0);
  const topCat     = categories.reduce((a, b) => a.spend > b.spend ? a : b);
  const avgSpend   = (totalSpend / categories.length).toFixed(1);
  const treemapData = categories.map((c) => ({ name: c.category, size: c.spend, value: c.spend, spend: c.spend }));

  return (
    <div>
      <div className="page-title-block">
        <div><h2><span className="page-title-accent"/>Category-wise Spend</h2>
          <p>Spend by procurement category — distribution, ranking, and trends.</p></div>
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilter} />

      <div className="grid-cards">
        <KpiCard id="kpi-cat-count"  title="# Categories"       value={categories.length}              subtext="Active categories" icon={<Tag size={16}/>} />
        <KpiCard id="kpi-top-cat"   title="Top Category"        value={topCat.category}                subtext={`₹${topCat.spend} Cr`} icon={<BarChart2 size={16}/>} accentColor="#de0303" />
        <KpiCard id="kpi-avg-cat"   title="Avg Category Spend"  value={`₹${avgSpend} Cr`}             subtext="Per category" icon={<TrendingUp size={16}/>} />
      </div>

      <div className="charts-grid">
        {/* Treemap */}
        <div className="chart-container" id="chart-cat-treemap">
          <div className="chart-header"><h3>Category Spend Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <Treemap data={treemapData} dataKey="size" content={<CustomCell/>} />
          </ResponsiveContainer>
        </div>

        {/* Horizontal bar ranking */}
        <div className="chart-container" id="chart-cat-ranking">
          <div className="chart-header"><h3>Category Ranking (INR Cr)</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[...categories].sort((a,b)=>b.spend-a.spend)} layout="vertical" margin={{top: 10, right: 35, left: 15, bottom: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false}/>
              <XAxis type="number" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Spend (₹ Cr)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
              <YAxis type="category" dataKey="category" stroke="var(--text-muted)" tick={{fontSize:11}} width={75} label={{ value: 'Category', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
              <Tooltip contentStyle={getTooltipStyle()}/>
              <Bar dataKey="spend" fill="var(--lumax-red)" radius={[0,5,5,0]} name="Spend (Cr)">
                <LabelList dataKey="spend" position="right" offset={8} style={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="chart-container" id="chart-cat-trend" style={{marginBottom:'1.5rem'}}>
        <div className="chart-header"><h3>Monthly Category Spend Trend (INR Cr)</h3></div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend} margin={{top: 15, right: 25, left: 15, bottom: 15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false}/>
            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize:11}} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} height={35} />
            <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} width={55} label={{ value: 'Spend (₹ Cr)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-muted)', fontSize: 10, style: { textAnchor: 'middle' } }} />
            <Tooltip contentStyle={getTooltipStyle()}/>
            <Legend wrapperStyle={{fontSize:'0.78rem'}}/>
            {categories.map((c, i) => (
              <Line key={c.category} type="monotone" dataKey={c.category} stroke={CAT_COLORS[i%CAT_COLORS.length]}
                strokeWidth={2} dot={{r:3,strokeWidth:0}} activeDot={{r:5}}>
                <LabelList dataKey={c.category} position="top" offset={8} style={{ fill: CAT_COLORS[i%CAT_COLORS.length], fontSize: 8, fontWeight: 500 }} />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Supplier-Category matrix table */}
      {matrix && (
        <div className="chart-container" id="table-supplier-matrix" style={{marginBottom:'1.5rem'}}>
          <div className="chart-header"><h3>Top Suppliers by Category (INR Cr)</h3></div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  {matrix.categories.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {matrix.suppliers.map(s => (
                  <tr key={s.name}>
                    <td style={{fontWeight:600}}>{s.name}</td>
                    {matrix.categories.map(c => (
                      <td key={c} style={{color: s[c] > 0 ? 'var(--lumax-red)' : 'var(--text-muted)', fontWeight: s[c] > 0 ? 600 : 400}}>
                        {s[c] > 0 ? `₹${s[c]} Cr` : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div className="chart-container" id="table-cat-detail">
        <div className="chart-header"><h3>Category Detail</h3></div>
        <div className="table-container">
          <table className="custom-table">
            <thead><tr><th>Category</th><th>Spend (Cr)</th><th>Share %</th><th>YoY</th><th>Top Supplier</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.category}>
                  <td style={{fontWeight:600}}>{c.category}</td>
                  <td>₹{c.spend.toLocaleString('en-IN')}</td>
                  <td>{c.share}%</td>
                  <td><span className={c.yoyChange >= 0 ? 'trend-up' : 'trend-down'}>{c.yoyChange >= 0 ? '+' : ''}{c.yoyChange}%</span></td>
                  <td>{c.topSupplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
