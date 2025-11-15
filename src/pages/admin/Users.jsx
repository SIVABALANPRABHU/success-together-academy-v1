import React, { useState } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import './Users.css';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Sample data - replace with actual API call
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Student',
      status: 'Active',
      joinedDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Student',
      status: 'Active',
      joinedDate: '2024-01-20',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Instructor',
      status: 'Active',
      joinedDate: '2023-12-10',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      role: 'Student',
      status: 'Inactive',
      joinedDate: '2024-02-01',
    },
  ];

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, row) => (
        <div className="user-cell">
          <div className="user-avatar">{value.charAt(0)}</div>
          <span>{value}</span>
        </div>
      ),
    },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge status-badge--${value.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
    { key: 'joinedDate', title: 'Joined Date' },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              setSelectedUser(row);
              setIsModalOpen(true);
            }}
          >
            View
          </Button>
          <Button variant="danger" size="small">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <div>
          <h1 className="admin-page-title">Users Management</h1>
          <p className="admin-page-subtitle">Manage all users in the system</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add New User
        </Button>
      </div>

      <Card>
        <div className="admin-users-filters">
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? 'User Details' : 'Add New User'}
        size="medium"
        footer={
          <div>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        {selectedUser ? (
          <div className="user-details">
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
            <p><strong>Joined Date:</strong> {selectedUser.joinedDate}</p>
          </div>
        ) : (
          <div className="user-form">
            <Input label="Name" placeholder="Enter user name" fullWidth required />
            <Input label="Email" type="email" placeholder="Enter email" fullWidth required />
            <Input label="Role" placeholder="Select role" fullWidth required />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;

