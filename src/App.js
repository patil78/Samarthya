// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Context and Components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import all your page components
import AuthPage from './components/AuthPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
// We don't need to import StudentDashboard here anymore, as StudentArea handles it.
import CompanyDashboard from './components/company/CompanyDashboardNew';
import AdminDashboard from './components/AdminDashboard';
import StudentArea from './pages/StudentArea'; // 👈 1. IMPORT THE NEW CONTROLLER COMPONENT

function App() {
  return (
    <BrowserRouter>
      {/* The AuthProvider makes user data available to all components */}
      <AuthProvider>
        <Routes>
          {/* --- Public Routes --- */}
          {/* These routes are accessible to everyone */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* --- Protected Routes --- */}
          {/* To access these routes, the user must meet the role requirements */}
          
          {/* Student Dashboard Route */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentArea /> {/* 👈 2. USE StudentArea HERE */}
              </ProtectedRoute>
            }
          />

          {/* Company Dashboard Route */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;