import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  fullPage?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = '#3182ce', 
  text = 'Loading...', 
  fullPage = false 
}) => {
  const getSize = () => {
    switch(size) {
      case 'small': return '24px';
      case 'large': return '48px';
      case 'medium':
      default: return '36px';
    }
  };

  const spinnerStyles: React.CSSProperties = {
    width: getSize(),
    height: getSize(),
    borderRadius: '50%',
    border: `3px solid ${color}20`,
    borderTopColor: color,
    animation: 'spinner 0.8s linear infinite',
    marginBottom: text ? '1rem' : 0
  };

  const containerStyles: React.CSSProperties = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  };

  return (
    <div style={containerStyles} className="spinner-container">
      <style>
        {`
          @keyframes spinner {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyles} className="spinner"></div>
      {text && <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
};

export default Spinner; 