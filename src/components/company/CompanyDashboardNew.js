import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import JobPostingFormNew from './JobPostingFormNew';
import PostedJobsList from './PostedJobsList';
import AllocatedStudents from './AllocatedStudents';

const API_BASE_URL = 'http://localhost:8000';

const CompanyDashboardNew = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('dashboard'); // dashboard, postJob, viewStudents
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allocatedStudentsError, setAllocatedStudentsError] = useState('');
  const [orgId, setOrgId] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [allocatedStudents, setAllocatedStudents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalPosted: 0,
    totalAllocated: 0,
    totalWaiting: 0
  });

  // Extract organization_id from user object
  useEffect(() => {
    console.log('User object:', user);
    if (user && user.organization_id) {
      console.log('Setting orgId from user.organization_id:', user.organization_id);
      setOrgId(user.organization_id);
    } else if (user && user.id) {
      // The login stores organization_id as 'id' in the user object
      console.log('Setting orgId from user.id:', user.id);
      setOrgId(user.id);
    } else {
      console.log('No organization ID found in user object');
    }
  }, [user]);

  // Load posted jobs and allocated students when orgId is available
  useEffect(() => {
    console.log('orgId changed:', orgId);
    if (orgId) {
      loadPostedJobs();
      loadAllocatedStudents();
    }
  }, [orgId]);

  // Load posted job opportunities
  const loadPostedJobs = async () => {
    try {
      setLoading(true);
      console.log('Loading posted jobs for orgId:', orgId);
      const response = await axios.get(`${API_BASE_URL}/organization/${orgId}/sectors`);
      console.log('Posted jobs response:', response.data);
      setPostedJobs(response.data.sectors || []);
      setStatistics(prev => ({ ...prev, totalPosted: response.data.sectors?.length || 0 }));
    } catch (err) {
      console.error('Error loading posted jobs:', err);
      console.error('Error details:', err.response);
      // Don't show error if just empty, only on actual error
      if (err.response && err.response.status !== 404) {
        setError('Failed to load posted jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load allocated students
  const loadAllocatedStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/company`, {
        params: { email: user.email }
      });
      
      if (response.data.data) {
        setAllocatedStudents(response.data.data);
      } else if (Array.isArray(response.data)) {
        setAllocatedStudents(response.data);
      } else {
        setAllocatedStudents([]);
      }

      // Calculate statistics
      const allocated = allocatedStudents.filter(s => s.status === 'Allocated').length;
      const waiting = allocatedStudents.filter(s => s.status === 'Waiting').length;
      setStatistics(prev => ({ 
        ...prev, 
        totalAllocated: allocated,
        totalWaiting: waiting
      }));
    } catch (err) {
      console.error('Error loading allocated students:', err);
      if (err.response?.status !== 404) {
        setAllocatedStudentsError('Failed to load allocated students');
      }
    }
  };

  // Handle job posting success
  const handleJobPosted = () => {
    loadPostedJobs();
    setView('dashboard');
  };

  // Handle job deletion
  const handleDeleteJob = async (sectorId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/organization/${orgId}/sectors/${sectorId}`);
      loadPostedJobs();
      alert('Job posting deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job posting');
    }
  };

  // Render dashboard view
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.email}</p>
          </div>
          <button 
            onClick={logout} 
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-semibold">Total Job Postings</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.totalPosted}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-semibold">Allocated Students</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{statistics.totalAllocated}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-semibold">Waiting List</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.totalWaiting}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setView('postJob')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
          >
            Post New Job
          </button>
          <button
            onClick={() => setView('viewStudents')}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            View Allocated Students
          </button>
          <button
            onClick={() => {
              loadPostedJobs();
              loadAllocatedStudents();
            }}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700"
          >
            Refresh Data
          </button>
        </div>

        {/* Show allocated students error separately */}
        {allocatedStudentsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {allocatedStudentsError}
          </div>
        )}

        {/* Posted Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <PostedJobsList 
            jobs={postedJobs} 
            onDelete={handleDeleteJob}
            onRefresh={loadPostedJobs}
          />
        )}
      </div>
    </div>
  );

  // Render based on current view
  switch (view) {
    case 'postJob':
      return (
        <JobPostingFormNew
          orgId={orgId}
          onSuccess={handleJobPosted}
          onCancel={() => setView('dashboard')}
        />
      );
    
    case 'viewStudents':
      return (
        <AllocatedStudents
          students={allocatedStudents}
          onBack={() => setView('dashboard')}
          userEmail={user?.email}
        />
      );
    
    default:
      return renderDashboard();
  }
};

export default CompanyDashboardNew;
