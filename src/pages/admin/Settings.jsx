import React from 'react';
import Card from '../../components/common/Card/Card';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import './Settings.css';

const Settings = () => {
  return (
    <div className="admin-settings">
      <div className="admin-settings-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">Manage system settings and preferences</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <Card title="General Settings">
          <div className="settings-form">
            <Input label="Site Name" placeholder="Enter site name" fullWidth />
            <Input label="Site Email" type="email" placeholder="Enter site email" fullWidth />
            <Input label="Site URL" placeholder="https://example.com" fullWidth />
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>

        <Card title="Security Settings">
          <div className="settings-form">
            <Input label="Password" type="password" placeholder="Enter new password" fullWidth />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              fullWidth
            />
            <Button variant="primary">Update Password</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

