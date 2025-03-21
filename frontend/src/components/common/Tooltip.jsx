import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Tooltip.css';

const Tooltip = ({ content, children, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        let top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        let left;

        switch (position) {
          case 'right':
            left = triggerRect.right + scrollLeft + 8;
            break;
          case 'left':
            left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
            break;
          case 'top':
            top = triggerRect.top + scrollTop - tooltipRect.height - 8;
            left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case 'bottom':
            top = triggerRect.bottom + scrollTop + 8;
            left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
            break;
          default:
            left = triggerRect.right + scrollLeft + 8;
        }

        // Adjust position if tooltip would go off screen
        if (left + tooltipRect.width > window.innerWidth) {
          left = window.innerWidth - tooltipRect.width - 8;
        }
        if (left < 0) {
          left = 8;
        }
        if (top + tooltipRect.height > window.innerHeight + scrollTop) {
          top = window.innerHeight + scrollTop - tooltipRect.height - 8;
        }
        if (top < scrollTop) {
          top = scrollTop + 8;
        }

        setTooltipPosition({ top, left });
      }
    };

    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position]);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div ref={triggerRef}>
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${position}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
};

export default Tooltip; 