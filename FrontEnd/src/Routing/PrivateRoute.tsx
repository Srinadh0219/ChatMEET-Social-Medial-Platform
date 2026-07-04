import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import auth from '../auth/auth-help';

const PrivateRoute: React.FC = () => {
  const isAuthenticated = auth.isAuthenticated();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
