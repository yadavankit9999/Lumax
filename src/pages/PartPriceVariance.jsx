import React, { useEffect, useState } from 'react';
import { ChevronRight, Zap, ArrowLeft, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function PartPriceVariance() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState('Procurement Head'); // 'Procurement Head' or 'Category Manager'
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/ai-insights/part-price-variance`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="loading-state"><div className="loading-spinner" /><p>Loading AI Insights…</p></div>;
  }

  const { summary, categorySummary, deepDive } = data;

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedSubCategory(null);
  };

  const currentCategoryData = role === 'Category Manager' 
    ? categorySummary.filter(c => c.category === 'Electronics')
    : categorySummary;

  return (
    <div className="ai-insight-page">
      <div className="back-link-container">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to Executive Summary
        </button>
      </div>

      <div className="page-title-block flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2><span className="page-title-accent ai-accent-zap" /><Zap size={24} style={{marginRight: 8, color: '#eab308'}}/>Part Price Variance Recommender</h2>
          <p>AI spots the same part priced differently across locations and suppliers to identify cost savings.</p>
        </div>
        <div className="role-switcher">
          <label htmlFor="role-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>View as:</label>
          <select id="role-select" value={role} onChange={handleRoleChange} className="custom-select" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <option value="Procurement Head">CPO & Direct Material Head</option>
            <option value="Category Manager">Cost Analyst & Category Manager (Electronics)</option>
          </select>
        </div>
      </div>

      {!selectedSubCategory ? (
        <div className="summary-view fade-in">
          <div className="insight-card ai-glow-border-zap">
            <div className="insight-header">
              <h3>
                {role === 'Procurement Head' 
                  ? 'AI part price variance — opportunities' 
                  : 'Electronics — price variance opportunities'}
              </h3>
              <p className="insight-sub">
                Same part priced differently across plants - level every plant to the best rate - updated today
              </p>
            </div>
            
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <KpiCard title="Scope" value={role === 'Procurement Head' ? "All categories" : "Electronics"} />
              <KpiCard title="Sub-categories flagged" value={role === 'Procurement Head' ? summary.flaggedCategories : currentCategoryData.length} />
              <KpiCard title="SKUs analysed" value={role === 'Procurement Head' ? summary.skusAnalysed : 128} />
              <KpiCard title="SKUs with price gap" value={role === 'Procurement Head' ? summary.skusWithGap : 26} valueColor="#ef4444" />
              <KpiCard title="Potential savings" value={`~₹${role === 'Procurement Head' ? summary.potentialSaving : '28 L'}`} valueColor="#16a34a" />
            </div>

            <div className="table-container">
              <div style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                Sub-categories with price variation across plants
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Each sub-category rolls up the SKUs where the same part is priced differently across plants. Click a sub-category to see the SKU-level detail.
              </p>
              <table className="custom-table interactive-table">
                <thead>
                  <tr>
                    <th>Sub-category</th>
                    <th>Category</th>
                    <th>SKUs analysed</th>
                    <th>SKUs with gap</th>
                    <th>Highest gap</th>
                    <th>Potential saving</th>
                    <th style={{width: 40}}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategoryData.map((row, idx) => (
                    <tr key={idx} onClick={() => setSelectedSubCategory(row)} className="clickable-row">
                      <td style={{ fontWeight: 600 }}>{row.subCategory}</td>
                      <td>{row.category}</td>
                      <td style={{ fontSize: '1.1rem', fontWeight: 600 }}>{row.skusAnalysed}</td>
                      <td style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444' }}>{row.skusWithGap}</td>
                      <td><span className="badge badge-yellow">{row.highestGap}</span></td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>~₹{row.saving}</td>
                      <td><ChevronRight size={16} color="var(--text-muted)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ai-insight-footer zap-footer">
              <Zap size={14} color="#eab308" style={{marginRight: 6}} />
              <span><strong>AI insight:</strong> Connector terminals carries the largest recoverable gap (~₹28 L across 26 SKUs). Pure internal arithmetic on prices already paid — fully defensible, no external data needed. Refreshed quarterly for this view.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="deep-dive-view slide-in-right">
          <button className="back-button" onClick={() => setSelectedSubCategory(null)}>
            <ArrowLeft size={16} /> Back to Summary
          </button>

          <div className="insight-card ai-glow-border-zap" style={{ marginTop: '1rem' }}>
            <div className="insight-header">
              <h3>
                AI Part Price Variance Recommender
              </h3>
              <p className="insight-sub">Same part & supplier, different price across plants - level every plant to the best rate</p>
            </div>

            <div className="filters-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
              <div className="filter-pill">
                <span className="filter-label">Category</span>
                <span className="filter-value">{selectedSubCategory.category}</span>
              </div>
              <div className="filter-pill">
                <span className="filter-label">Sub-category</span>
                <span className="filter-value">{selectedSubCategory.subCategory}</span>
              </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
              <KpiCard title="SKUs analysed" value={selectedSubCategory.skusAnalysed} />
              <KpiCard title="SKUs with price gap" value={selectedSubCategory.skusWithGap} valueColor="#ef4444" />
              <KpiCard title="Potential savings" value={`~₹${selectedSubCategory.saving}`} valueColor="#16a34a" />
            </div>

            <div className="table-container">
              <div style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                SKU-level price variation across plants — {selectedSubCategory.subCategory}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Same part from the same supplier priced differently across plants. Aligning every plant to the lowest validated price recovers the gap.
              </p>
              <table className="custom-table variance-table">
                <thead>
                  <tr>
                    <th>Part / SKU</th>
                    <th>Supplier</th>
                    <th>Bawal</th>
                    <th>Manesar</th>
                    <th>Gurgaon</th>
                    <th>Chakan</th>
                    <th>Min price</th>
                    <th>Annual qty (FY26)</th>
                    <th>Predicted saving</th>
                  </tr>
                </thead>
                <tbody>
                  {(deepDive[selectedSubCategory.subCategory] || []).map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.sku}</td>
                      <td>{row.supplier}</td>
                      <td className={row.bawal === row.minPrice ? 'min-price' : (row.bawal > row.minPrice && row.bawal === Math.max(row.bawal||0, row.manesar||0, row.gurgaon||0, row.chakan||0)) ? 'max-price' : ''}>
                        ₹{row.bawal}
                      </td>
                      <td className={row.manesar === row.minPrice ? 'min-price' : (row.manesar > row.minPrice && row.manesar === Math.max(row.bawal||0, row.manesar||0, row.gurgaon||0, row.chakan||0)) ? 'max-price' : ''}>
                        ₹{row.manesar}
                      </td>
                      <td className={row.gurgaon === row.minPrice ? 'min-price' : (row.gurgaon > row.minPrice && row.gurgaon === Math.max(row.bawal||0, row.manesar||0, row.gurgaon||0, row.chakan||0)) ? 'max-price' : ''}>
                        ₹{row.gurgaon}
                      </td>
                      <td className={row.chakan === row.minPrice ? 'min-price' : (row.chakan > row.minPrice && row.chakan === Math.max(row.bawal||0, row.manesar||0, row.gurgaon||0, row.chakan||0)) ? 'max-price' : ''}>
                        ₹{row.chakan}
                      </td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>₹{row.minPrice}</td>
                      <td>{row.annualQty}</td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>~₹{row.saving}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Green</span> = lowest validated price (the alignment target) &nbsp;&nbsp;&nbsp; <span style={{ color: '#ef4444', fontWeight: 600 }}>Red</span> = highest price paid. Saving = (plant price − min price) × that plant's annual qty, summed across plants.
            </div>

            <div className="ai-insight-footer zap-footer" style={{ marginTop: '1.5rem' }}>
              <Zap size={14} color="#eab308" style={{marginRight: 6}} />
              <span><strong>AI insight:</strong> CT-1042 costs ₹57 at Chakan but only ₹50 at Bawal — same part, same supplier (A), a 14% gap with no justification. Leveling all plants to each part's lowest validated price recovers ~₹28 L this year. Targets to be confirmed with category managers.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
