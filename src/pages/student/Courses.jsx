import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

const StudentCourses = () => {
  const navigate = useNavigate();

  return (
    <div className="student-courses">
      <div className="courses-header">
        <h1>My Courses</h1>
        <button 
          className="back-btn"
          onClick={() => navigate('/student/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="courses-content">
        <p>This page will show all your enrolled courses. Navigate to Dashboard to view your courses.</p>
      </div>
    </div>
  );
};

export default StudentCourses;

