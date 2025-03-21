import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Visibility, 
  VisibilityOff,
  ErrorOutline,
  CheckCircleOutline 
} from '@mui/icons-material';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  id,
  name,
  value = '',
  onChange = () => {},
  placeholder,
  required = false,
  disabled = false,
  className = '',
  autoComplete = 'off',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputClasses = [
    'input',
    error && 'input--error',
    isFocused && 'input--focused',
    value && 'input--has-value',
    className
  ].filter(Boolean).join(' ');

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className="input-wrapper" style={{ '--index': props.index || 0 }}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-label-required">*</span>}
        </label>
      )}
      <div className="input-field-wrapper">
        <input
          ref={ref}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          {...props}
        />
        
        <div className="input-icons">
          {type === 'password' && (
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          )}
          
          {error && (
            <div className="input-status-icon input-error-icon">
              <ErrorOutline />
            </div>
          )}
          
          {!error && value && (
            <div className="input-status-icon input-success-icon">
              <CheckCircleOutline />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="input-error-message">
          <ErrorOutline className="input-error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      {props.hint && !error && (
        <div className="input-hint">{props.hint}</div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  autoComplete: PropTypes.string,
  hint: PropTypes.string,
  index: PropTypes.number,
};

export default Input; 