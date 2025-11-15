import React from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import './Payments.css';

const Payments = () => {
  const payments = [
    {
      id: 1,
      user: 'John Doe',
      course: 'React Fundamentals',
      amount: '$49',
      status: 'Completed',
      date: '2024-02-15',
    },
    {
      id: 2,
      user: 'Jane Smith',
      course: 'JavaScript Mastery',
      amount: '$59',
      status: 'Completed',
      date: '2024-02-14',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      course: 'Python for Beginners',
      amount: '$39',
      status: 'Pending',
      date: '2024-02-16',
    },
  ];

  const columns = [
    { key: 'user', title: 'User' },
    { key: 'course', title: 'Course' },
    { key: 'amount', title: 'Amount' },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge status-badge--${value.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
    { key: 'date', title: 'Date' },
  ];

  return (
    <div className="admin-payments">
      <div className="admin-payments-header">
        <div>
          <h1 className="admin-page-title">Payments</h1>
          <p className="admin-page-subtitle">View and manage all payment transactions</p>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={payments} emptyMessage="No payments found" />
      </Card>
    </div>
  );
};

export default Payments;

