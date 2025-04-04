import React from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './PageSizeSelector.css';

const PageSizeSelector = ({ pageSize, onPageSizeChange }) => {
  const pageSizeOptions = [10, 25, 50, 100];

  return (
    <div className="page-size-selector">
      <label htmlFor="page-size">Items per page:</label>
      <select
        id="page-size"
        value={pageSize}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => onPageSizeChange(Number(e.target.value))}
        className="page-size-select"
      >
        {pageSizeOptions.map(size => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
};

PageSizeSelector.propTypes = {
  pageSize: PropTypes.number.isRequired,
  onPageSizeChange: PropTypes.func.isRequired
};

export default PageSizeSelector; 