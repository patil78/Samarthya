import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CompanyAllocatedStudents from './CompanyAllocatedStudents';

const API_BASE_URL = 'http://localhost:8000';

const AdminMainView = ({ setView }) => {
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runningAllocation, setRunningAllocation] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'allocated'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [studentsRes, jobsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/students`),
        axios.get(`${API_BASE_URL}/admin/jobs`)
      ]);
      
      setStudents(studentsRes.data.students || []);
      setJobs(jobsRes.data.jobs || []);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAllocation = async () => {
    if (!window.confirm('Are you sure you want to run the allocation algorithm? This will match students to job opportunities.')) {
      return;
    }

    try {
      setRunningAllocation(true);
      const response = await axios.post(`${API_BASE_URL}/admin/run-allocation`);
      alert(response.data.message || 'Allocation completed successfully!');
      await fetchData();
    } catch (err) {
      console.error('Error running allocation:', err);
      alert(err.response?.data?.detail || 'Failed to run allocation');
    } finally {
      setRunningAllocation(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading data...</div>;
  }

  // Show allocated students view
  if (activeTab === 'allocated') {
    return <CompanyAllocatedStudents onBack={() => setActiveTab('dashboard')} />;
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleRunAllocation}
            disabled={runningAllocation}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {runningAllocation ? 'Running...' : '🚀 Run Allocation'}
          </button>
          <button 
            onClick={() => setActiveTab('allocated')}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
          >
            👥 View Allocated
          </button>
          <button 
            onClick={() => setView('analytics')} 
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            📊 View Analytics
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Student Data Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Registered Students ({students.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Degree</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">CGPA</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Top Preference</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id || index}>
                    <td className="px-4 py-3 text-sm text-gray-800">{student.fullName || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.mobile || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.degree || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.cgpa || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.topPreference || 'Not set'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No students registered yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Job Openings Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Company Job Openings ({jobs.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Company Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sector</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Vacancies</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Skills</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <tr key={job.job_id || index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{job.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.sector}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.vacancies}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.skills || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No job openings posted yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMainView;