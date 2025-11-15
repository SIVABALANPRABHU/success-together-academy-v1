import React, { useState } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import './Courses.css';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with actual API call
  const courses = [
    {
      id: 1,
      title: 'React Fundamentals',
      instructor: 'John Doe',
      students: 234,
      price: '$49',
      status: 'Published',
      createdDate: '2024-01-10',
    },
    {
      id: 2,
      title: 'JavaScript Mastery',
      instructor: 'Jane Smith',
      students: 456,
      price: '$59',
      status: 'Published',
      createdDate: '2024-01-15',
    },
    {
      id: 3,
      title: 'Python for Beginners',
      instructor: 'Mike Johnson',
      students: 189,
      price: '$39',
      status: 'Draft',
      createdDate: '2024-02-01',
    },
    {
      id: 4,
      title: 'Advanced Node.js',
      instructor: 'Sarah Williams',
      students: 123,
      price: '$69',
      status: 'Published',
      createdDate: '2024-01-20',
    },
  ];

  const columns = [
    { key: 'title', title: 'Course Title' },
    { key: 'instructor', title: 'Instructor' },
    {
      key: 'students',
      title: 'Students',
      render: (value) => <span>{value} enrolled</span>,
    },
    { key: 'price', title: 'Price' },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge status-badge--${value.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
    { key: 'createdDate', title: 'Created Date' },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions">
          <Button variant="ghost" size="small">
            Edit
          </Button>
          <Button variant="danger" size="small">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-courses">
      <div className="admin-courses-header">
        <div>
          <h1 className="admin-page-title">Courses Management</h1>
          <p className="admin-page-subtitle">Manage all courses in the platform</p>
        </div>
        <Button variant="primary">Add New Course</Button>
      </div>

      <Card>
        <div className="admin-courses-filters">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredCourses}
          emptyMessage="No courses found"
        />
      </Card>
    </div>
  );
};

export default Courses;

