import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminMainView from './admin/AdminMainView';
import AdminAnalyticsView from './admin/AdminAnalyticalView';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [view, setView] = useState('welcome');

  const WelcomeScreen = () => (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800">Welcome, Admin!</h1>
      <p className="mt-4 text-lg text-gray-600">Manage student and company data, and view analytics.</p>
      <button 
        onClick={() => setView('main')}
        className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700"
      >
        Enter Dashboard
      </button>
       <button onClick={logout} className="block mx-auto mt-4 text-sm text-gray-500 hover:underline">
        Logout
      </button>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'main':
        return <AdminMainView setView={setView} />;
      case 'analytics':
        return <AdminAnalyticsView setView={setView} />;
      case 'welcome':
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;