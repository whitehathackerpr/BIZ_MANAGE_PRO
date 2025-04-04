import React from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.css';

const StatCard = ({ title, value, change, icon, trend }) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'var(--success-green)';
    if (trend === 'down') return 'var(--error-red)';
    return 'var(--medium-text)';
  };

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-content">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-change" style={{ color: getTrendColor() }}>
          {change}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
};

export default StatCard; 