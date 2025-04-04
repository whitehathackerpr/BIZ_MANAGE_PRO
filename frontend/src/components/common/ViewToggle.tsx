import React from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './ViewToggle.css';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-button ${view === 'table' ? 'active' : ''}`}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onViewChange('table')}
        title="Table View"
      >
        <span className="view-icon">📊</span>
      </button>
      <button
        className={`view-toggle-button ${view === 'grid' ? 'active' : ''}`}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onViewChange('grid')}
        title="Grid View"
      >
        <span className="view-icon">🖼️</span>
      </button>
    </div>
  );
};

ViewToggle.propTypes = {
  view: PropTypes.oneOf(['table', 'grid']).isRequired,
  onViewChange: PropTypes.func.isRequired
};

export default ViewToggle; 