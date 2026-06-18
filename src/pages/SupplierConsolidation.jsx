import React, { useEffect, useState } from 'react';
import { ChevronRight, Sparkles, ArrowLeft, ArrowUpRight, DollarSign, Users } from 'lucide-react';
import KpiCard from '../components/KpiCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SupplierConsolidation() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState('Procurement Head'); // 'Procurement Head' or 'Category Manager'
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/ai-insights/supplier-consolidation`)
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
      <div className="page-title-block flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2><span className="page-title-accent ai-accent" /><Sparkles size={24} style={{marginRight: 8, color: 'var(--lumax-red)'}}/>Supplier Consolidation Recommender</h2>
          <p>AI flags sub-categories with 5+ suppliers and recommends who to keep or exit.</p>
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
          <div className="insight-card ai-glow-border">
            <div className="insight-header">
              <h3>
                {role === 'Procurement Head' 
                  ? 'AI supplier consolidation — opportunities' 
                  : 'Electronics — supplier consolidation'}
              </h3>
              <p className="insight-sub">
                {role === 'Procurement Head' 
                  ? 'Sub-categories where supplier base can be reduced across all categories.'
                  : 'Sub-categories within Electronics where supplier base can be reduced.'}
              </p>
            </div>
            
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <KpiCard title="Sub-categories flagged" value={role === 'Procurement Head' ? summary.flaggedCategories : currentCategoryData.length} />
              <KpiCard title="Current supplier base" value={role === 'Procurement Head' ? summary.currentBase : 23} />
              <KpiCard title="Recommended base" value={role === 'Procurement Head' ? summary.recommendedBase : 13} valueColor="#0284c7" />
              <KpiCard title="Potential saving FY27" value={role === 'Procurement Head' ? `~₹${summary.potentialSaving}` : '~₹6.4 Cr'} valueColor="#16a34a" />
            </div>

            <div className="table-container">
              <table className="custom-table interactive-table">
                <thead>
                  <tr>
                    <th>Sub-category</th>
                    <th>Current base</th>
                    <th>Recommended base</th>
                    <th>Spend FY26</th>
                    <th>Saving FY27</th>
                    <th style={{width: 40}}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategoryData.map((row, idx) => (
                    <tr key={idx} onClick={() => setSelectedSubCategory(row)} className="clickable-row">
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.subCategory}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {row.category}</div>
                        {/* Mock dots for existing suppliers */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          {Array.from({length: row.currentBase}).map((_, i) => (
                            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i < row.recommendedBase ? '#22c55e' : (i < row.recommendedBase + 2 ? '#f59e0b' : '#ef4444') }}></span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '1.1rem', fontWeight: 600 }}>{row.currentBase}</td>
                      <td style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0284c7' }}>{row.recommendedBase}</td>
                      <td>₹{row.spend}</td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>~₹{row.saving}</td>
                      <td><ChevronRight size={16} color="var(--text-muted)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ai-insight-footer">
              <Sparkles size={14} color="#0284c7" style={{marginRight: 6}} />
              <span><strong>AI insight:</strong> {summary.flaggedCategories} sub-categories carry 5+ suppliers each. Connector / terminal shows the largest tail. Click any sub-category to open the full action plan. Estimates need category-manager validation.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="deep-dive-view slide-in-right">
          <button className="back-button" onClick={() => setSelectedSubCategory(null)}>
            <ArrowLeft size={16} /> Back to Summary
          </button>

          <div className="insight-card ai-glow-border" style={{ marginTop: '1rem' }}>
            <div className="insight-header">
              <h3>
                {selectedSubCategory.subCategory}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 400 }}>
                  Category: {selectedSubCategory.category}
                </span>
              </h3>
              <p className="insight-sub">Recommended action to reduce supplier base</p>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <KpiCard title="Current suppliers" value={selectedSubCategory.currentBase} />
              <KpiCard title="Recommended" value={selectedSubCategory.recommendedBase} />
              <KpiCard title="Category spend FY26" value={`₹${selectedSubCategory.spend}`} />
              <KpiCard title="Potential saving FY27" value={`~₹${selectedSubCategory.saving}`} valueColor="#16a34a" />
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>SOW (Cr / %)</th>
                    <th>Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(deepDive[selectedSubCategory.subCategory] || []).map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.supplier}</td>
                      <td>₹{row.sow}</td>
                      <td>
                        <span style={{ color: row.rating === 'Green' ? '#16a34a' : row.rating === 'Yellow' ? '#ca8a04' : '#dc2626', fontWeight: 600 }}>
                          {row.rating}
                        </span>
                      </td>
                      <td>
                        <span className={`action-badge action-${row.action.toLowerCase()}`}>
                          {row.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
