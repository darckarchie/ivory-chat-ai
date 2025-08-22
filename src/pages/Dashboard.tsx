import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardSimple from '@/components/DashboardSimple';
import { useUserStore } from '@/lib/store';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, logout } = useUserStore(state => ({
    isAuthenticated: state.isAuthenticated(),
    user: state.user,
    logout: state.logout
  }));

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  // Mock data for demo - replace with real data later
  const mockMetrics = {
    ordersToday: 12,
    reservationsToday: 8,
    appointmentsToday: 5,
    quotesToday: 3,
    messagesWaiting: 4,
    avgResponseMin: 6
  };

  // Use DashboardSimple for the new experience
  return <DashboardSimple sector={user.businessSector} metrics={mockMetrics} />;
};

export default Dashboard;