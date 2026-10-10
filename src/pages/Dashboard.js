import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🥋 BJJ Tournament System</h1>
        <p>Welcome back, {user?.fullName || user?.username}!</p>
      </div>
    </div>
  );
};

export default Dashboard;
