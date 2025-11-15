import React from 'react';
import Card from '../../components/common/Card/Card';
import './Analytics.css';

const Analytics = () => {
  return (
    <div className="admin-analytics">
      <div className="admin-analytics-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">View detailed analytics and reports</p>
        </div>
      </div>

      <Card title="Analytics Dashboard">
        <p>Analytics content will be displayed here.</p>
      </Card>
    </div>
  );
};

export default Analytics;

