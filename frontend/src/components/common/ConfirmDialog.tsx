import React from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => onCancel}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => onConfirm}
            className="button button-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog; 