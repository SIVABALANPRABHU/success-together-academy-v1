import React from 'react';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import './Lessons.css';

const Lessons = () => {
  return (
    <div className="admin-lessons">
      <div className="admin-lessons-header">
        <div>
          <h1 className="admin-page-title">Lessons Management</h1>
          <p className="admin-page-subtitle">Manage all lessons and course content</p>
        </div>
        <Button variant="primary">Add New Lesson</Button>
      </div>

      <Card title="Lessons">
        <p>Lessons management content will be displayed here.</p>
      </Card>
    </div>
  );
};

export default Lessons;

