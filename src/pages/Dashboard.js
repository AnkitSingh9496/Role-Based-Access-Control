import React, { useEffect, useState } from 'react';
import Navbar from './Navbar'; 
import styled from 'styled-components';
import { api } from '../api/mockApi';
import { Layout } from './Layout';
import {
  Users,
  Shield,
  ArrowUp,
  ArrowDown,
  RefreshCcw,
  Activity,
  LayoutDashboard,
} from 'lucide-react';

const Logo = styled.h1`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
`;

const StatCard = ({ title, value, icon: Icon, change, subtitle }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <div className="card-header-icon">
        <Icon className="icon" size={24} />
      </div>
      <div className="card-header-title">{title}</div>
    </div>
    <div className="card-value">{value}</div>
    {subtitle && <div className="card-subtitle">{subtitle}</div>}
    {change !== undefined && (
      <div className={`card-change ${change < 0 ? 'negative' : ''}`}>
        {change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        <span className="ml-1">{Math.abs(change)}%</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    activeUsers: 0,
    activeRoles: 0,
    lastUpdated: null,
    userChange: 0,
    roleChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const [users, roles] = await Promise.all([api.getUsers(), api.getRoles()]);
      
      setStats({
        totalUsers: users.length,
        totalRoles: 2,  
        activeUsers: Math.floor(users.length * 0.8),
        activeRoles: roles.filter((role) =>
          users.some((user) => user.roleId === role.id)
        ).length,
        lastUpdated: new Date(),
        userChange: 5,
        roleChange: 2,
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <Navbar>
        <Logo>Dashboard</Logo>
      </Navbar>

      <div className="dashboard-container">
        <div className="dashboard-header-container">
          <h1 className="dashboard-header">
            <LayoutDashboard className="icon mr-3" />
            Glance
          </h1>
        </div>

        {error && (
          <div className="error-alert">
            <Activity className="icon-error" />
            <span>{error}</span>
          </div>
        )}

        <div className="dashboard-grid">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            change={stats.userChange}
            subtitle={`${stats.activeUsers} active users`}
          />
          <StatCard
            title="Total Roles"
            value={stats.totalRoles}
            icon={Shield}
            change={stats.roleChange}
            subtitle={`${stats.activeRoles} active roles`}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={Activity}
            subtitle="Currently online"
          />
        </div>

        {stats.lastUpdated && (
          <div className="last-updated">
            Last updated: {stats.lastUpdated.toLocaleString()}
          </div>
        )}
      </div>

      <button
        onClick={fetchStats}
        disabled={loading}
        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:scale-105 hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50"
      >
        <RefreshCcw
          className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
        />
        Refresh
      </button>
    </Layout>
  );
};

export default Dashboard;