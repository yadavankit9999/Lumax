import React from 'react';

/**
 * FilterBar — shared filter row across all dashboards.
 * Props:
 *   filters: Array of { key, label, options: string[] }
 *   values:  { [key]: string }
 *   onChange: (key, value) => void
 */
export default function FilterBar({ filters = [], values = {}, onChange }) {
  if (!filters.length) return null;
  return (
    <div className="filter-bar" id="global-filter-bar">
      <span className="filter-bar-label">Filters</span>
      {filters.map(({ key, label, options }) => (
        <div className="filter-group" key={key}>
          <label className="filter-label" htmlFor={`filter-${key}`}>{label}</label>
          <select
            id={`filter-${key}`}
            className="filter-select"
            value={values[key] || ''}
            onChange={(e) => onChange?.(key, e.target.value)}
          >
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
