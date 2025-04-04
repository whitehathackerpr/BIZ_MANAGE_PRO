import React from 'react';
import React, { useState, useEffect } from 'react';
import Cache from '../../utils/cache';
import './CacheManager.css';

const CacheManager = ({ storageKey }) => {
  const [stats, setStats] = useState<Type>(null);
  const [isOpen, setIsOpen] = useState<Type>(false);
  const cache = new Cache(5 * 60 * 1000, storageKey);

  useEffect(() => {
    updateStats();
  }, [storageKey]);

  const updateStats = () => {
    setStats(cache.getStats());
  };

  const handleClearCache = () => {
    cache.clear();
    updateStats();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) {
    return (
      <button 
        className="cache-manager-toggle"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setIsOpen(true)}
        title="Cache Manager"
      >
        💾
      </button>
    );
  }

  return (
    <div className="cache-manager">
      <div className="cache-manager-header">
        <h3>Cache Manager</h3>
        <button 
          className="close-button"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setIsOpen(false)}
        >
          ×
        </button>
      </div>
      
      {stats && (
        <div className="cache-stats">
          <div className="stat-item">
            <span className="stat-label">Total Items:</span>
            <span className="stat-value">{stats.totalItems}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Expired Items:</span>
            <span className="stat-value">{stats.expiredItems}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Size:</span>
            <span className="stat-value">{formatSize(stats.totalSize)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">TTL:</span>
            <span className="stat-value">{Math.round(stats.ttl / 1000)}s</span>
          </div>
        </div>
      )}

      <div className="cache-actions">
        <button 
          className="button button-secondary"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClearCache}
        >
          Clear Cache
        </button>
        <button 
          className="button button-secondary"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => updateStats}
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default CacheManager; 