import React, { useState, forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './GoToPage.css';

const GoToPage = forwardRef(({ currentPage, totalPages, onPageChange, initialValue = '' }, ref) => {
  const [pageInput, setPageInput] = useState(initialValue);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setPageInput(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    
    if (isNaN(page)) {
      setError('Please enter a valid number');
      return;
    }

    if (page < 1 || page > totalPages) {
      setError(`Please enter a number between 1 and ${totalPages}`);
      return;
    }

    onPageChange(page);
    setPageInput('');
    setError('');
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Select the input text when focused
    if (ref.current) {
      ref.current.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <form 
      className={`go-to-page ${isFocused ? 'focused' : ''}`} 
      onSubmit={handleSubmit}
    >
      <label htmlFor="pageInput">Go to page:</label>
      <input
        ref={ref}
        type="number"
        id="pageInput"
        min="1"
        max={totalPages}
        value={pageInput}
        onChange={(e) => {
          setPageInput(e.target.value);
          setError('');
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={`1-${totalPages}`}
        aria-label="Page number"
      />
      {error && <span className="error-message">{error}</span>}
    </form>
  );
});

GoToPage.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  initialValue: PropTypes.string
};

export default GoToPage; 