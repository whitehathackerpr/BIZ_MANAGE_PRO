import React from 'react';
import PropTypes from 'prop-types';
import './DateRangeSelector.css';

const DateRangeSelector = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Last Year', value: '1y' },
  ];

  return (
    <div className="date-range-selector">
      {ranges.map((range) => (
        <button
          key={range.value}
          className={`range-button ${selectedRange === range.value ? 'active' : ''}`}
          onClick={() => onRangeChange(range.value)}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

DateRangeSelector.propTypes = {
  selectedRange: PropTypes.string.isRequired,
  onRangeChange: PropTypes.func.isRequired,
};

export default DateRangeSelector; 