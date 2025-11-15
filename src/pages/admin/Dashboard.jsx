import React from 'react';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: '👥',
    },
    {
      title: 'Total Courses',
      value: '56',
      change: '+5%',
      trend: 'up',
      icon: '📚',
    },
    {
      title: 'Active Students',
      value: '892',
      change: '+8%',
      trend: 'up',
      icon: '🎓',
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+15%',
      trend: 'up',
      icon: '💵',
    },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Enrolled in React Course', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'Completed JavaScript Basics', time: '4 hours ago' },
    { id: 3, user: 'Mike Johnson', action: 'Purchased Premium Plan', time: '6 hours ago' },
    { id: 4, user: 'Sarah Williams', action: 'Started Python Course', time: '8 hours ago' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Dashboard</h1>
        <p className="admin-dashboard-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="admin-dashboard-stats">
        {stats.map((stat, index) => (
          <Card key={index} className="admin-stat-card" hover>
            <div className="admin-stat-content">
              <div className="admin-stat-icon">{stat.icon}</div>
              <div className="admin-stat-info">
                <p className="admin-stat-title">{stat.title}</p>
                <h3 className="admin-stat-value">{stat.value}</h3>
                <p className={`admin-stat-change admin-stat-change--${stat.trend}`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <Card title="Recent Activities" className="admin-dashboard-card">
          <div className="admin-activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="admin-activity-item">
                <div className="admin-activity-content">
                  <p className="admin-activity-user">{activity.user}</p>
                  <p className="admin-activity-action">{activity.action}</p>
                </div>
                <span className="admin-activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
          <div className="admin-dashboard-card-footer">
            <Button variant="outline" size="small">
              View All Activities
            </Button>
          </div>
        </Card>

        <Card title="Quick Actions" className="admin-dashboard-card">
          <div className="admin-quick-actions">
            <Button variant="primary" fullWidth>
              Add New Course
            </Button>
            <Button variant="secondary" fullWidth>
              Manage Users
            </Button>
            <Button variant="outline" fullWidth>
              View Reports
            </Button>
            <Button variant="ghost" fullWidth>
              System Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

