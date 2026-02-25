import React from 'react';
import './LoadingSkeleton.css';

/**
 * Reusable loading skeleton component for data fetching states
 * @param {string} type - Type of skeleton (table, card, list)
 * @param {number} count - Number of skeleton items to show
 */
export const LoadingSkeleton = ({ type = 'table', count = 3 }) => {
  if (type === 'table') {
    return (
      <div className="skeleton-wrapper">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-cell short"></div>
            <div className="skeleton-cell medium"></div>
            <div className="skeleton-cell long"></div>
            <div className="skeleton-cell short"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="skeleton-wrapper">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-header"></div>
            <div className="skeleton-body">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="skeleton-wrapper">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
