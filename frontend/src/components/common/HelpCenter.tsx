import React from 'react';
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './HelpCenter.css';

const HelpCenter = ({ isCollapsed }) => {
  const [isOpen, setIsOpen] = useState<Type>(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const helpItems = [
    {
      title: 'Documentation',
      icon: '📚',
      description: 'Browse our comprehensive guides',
      link: '/docs'
    },
    {
      title: 'FAQs',
      icon: '❓',
      description: 'Find answers to common questions',
      link: '/faqs'
    },
    {
      title: 'Video Tutorials',
      icon: '🎥',
      description: 'Watch step-by-step tutorials',
      link: '/tutorials'
    },
    {
      title: 'Community Forum',
      icon: '👥',
      description: 'Connect with other users',
      link: '/community'
    }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const renderHelpButton = () => {
    if (isCollapsed) {
      return (
        <button 
          className="help-button collapsed"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggle}
          aria-label="Open Help Center"
        >
          <span className="help-icon">❓</span>
        </button>
      );
    }

    return (
      <button 
        className="help-button"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggle}
      >
        <span className="help-icon">❓</span>
        <span className="help-text">Need Help?</span>
        <span className={`help-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
    );
  };

  return (
    <div className="help-center" ref={dropdownRef}>
      {renderHelpButton()}
      {isOpen && (
        <div className="help-dropdown">
          {helpItems.map((item) => (
            <a
              key={item.title}
              href={item.link}
              className="help-item"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setIsOpen(false)}
            >
              <span className="help-item-icon">{item.icon}</span>
              <div className="help-item-content">
                <span className="help-item-title">{item.title}</span>
                <span className="help-item-description">{item.description}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

HelpCenter.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
};

export default HelpCenter; 