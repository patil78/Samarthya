// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user's role is not in the list of allowed roles, redirect
  if (!allowedRoles.includes(user.role)) {
    // You can create a dedicated "Unauthorized" page or redirect to login
    return <Navigate to="/login" />;
  }

  // If everything is fine, render the component
  return children;
};

export default ProtectedRoute;