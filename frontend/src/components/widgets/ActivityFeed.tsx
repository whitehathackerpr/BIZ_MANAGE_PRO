import React from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './ActivityFeed.css';

const ActivityFeed = ({ activities }) => {
  return (
    <div className="activity-feed">
      <h3 className="activity-feed-title">Recent Activity</h3>
      <div className="activity-feed-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">{activity.icon}</div>
            <div className="activity-content">
              <p className="activity-text">{activity.text}</p>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ActivityFeed.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ActivityFeed; 