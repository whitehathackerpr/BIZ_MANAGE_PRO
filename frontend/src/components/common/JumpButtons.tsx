import React from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './JumpButtons.css';

const JumpButtons = ({ onFirstPage, onLastPage, currentPage, totalPages }) => {
  return (
    <div className="jump-buttons">
      <button
        className="jump-button"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => onFirstPage}
        disabled={currentPage === 1}
        title="Jump to first page (Alt+Home)"
      >
        ⏮️
      </button>
      <button
        className="jump-button"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => onLastPage}
        disabled={currentPage === totalPages}
        title="Jump to last page (Alt+End)"
      >
        ⏭️
      </button>
    </div>
  );
};

JumpButtons.propTypes = {
  onFirstPage: PropTypes.func.isRequired,
  onLastPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
};

export default JumpButtons; 