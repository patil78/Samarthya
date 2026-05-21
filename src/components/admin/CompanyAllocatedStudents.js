import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const CompanyAllocatedStudents = ({ onBack }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [allocatedData, setAllocatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedStatus, setExpandedStatus] = useState('Accepted');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching companies...');
      
      const response = await axios.get(`${API_BASE_URL}/admin/allocation-statistics`);
      
      console.log('✅ Companies response:', response.data);
      
      const stats = response.data.statistics || [];
      setCompanies(stats);
      setError('');
      
      if (stats.length === 0) {
        setError('No companies found with allocations');
      }
    } catch (err) {
      console.error('❌ Error fetching companies:', err);
      setError(`Failed to load companies: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocatedStudents = async (orgId, orgName) => {
    try {
      setLoading(true);
      setError(''); // ✅ Clear error
      setAllocatedData(null); // ✅ Clear old data
      
      console.log(`📡 Fetching students for org: ${orgName} (ID: ${orgId})`);
      
      const response = await axios.get(
        `${API_BASE_URL}/admin/company/${orgId}/allocated-students`
      );
      
      console.log('✅ Students response:', response.data);
      
      // ✅ Set all state at once
      setAllocatedData(response.data);
      setSelectedCompany(orgId);
      setExpandedStatus('Accepted');
      
    } catch (err) {
      console.error('❌ Error fetching allocated students:', err);
      setError(`Failed to load allocated students: ${err.message}`);
      setAllocatedData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentTable = (students, status) => {
    if (!students || students.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
          <p className="text-lg">No students in <strong>{status}</strong> status</p>
        </div>
      );
    }

    // ✅ Remove duplicates by profile_id
    const uniqueStudents = Array.from(
      new Map(students.map(s => [s.profile_id, s])).values()
    );

    return (
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Student Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Sector</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="px-4 py-3 text-left font-semibold">Score</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Allocated At</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {uniqueStudents.map((student, index) => (
              <tr 
                key={`${student.profile_id}-${index}`}
                className="hover:bg-blue-50 transition"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {student.student_name || 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {student.student_email || 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-600 font-semibold text-blue-600">
                  {student.role || 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {student.sector || 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {student.location || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {student.allocation_score 
                      ? parseFloat(student.allocation_score).toFixed(2) 
                      : 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    student.status === 'Accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : student.status === 'Allocated'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.status || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {student.allocated_at 
                    ? new Date(student.allocated_at).toLocaleDateString() 
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // MAIN VIEW: Select Company
  if (!selectedCompany) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                📊 Company-wise Allocated Students
              </h2>
              <p className="text-gray-600 mt-2">
                View and manage student allocations across all companies
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition shadow-md"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded mb-6">
              <p className="font-semibold">⚠️ Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                📭 No companies found. Please create a company and post a job first.
              </p>
            </div>
          ) : (
            /* Company Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div
                  key={company.organization_id}
                  onClick={() => fetchAllocatedStudents(company.organization_id, company.org_name)}
                  className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition cursor-pointer border-l-4 border-blue-600 hover:scale-105 transform"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {company.org_name || 'Unknown Company'}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Accepted */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                      <p className="text-green-700 text-2xl font-bold">
                        {company.accepted || 0}
                      </p>
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        ✓ Accepted
                      </p>
                    </div>

                    {/* Allocated */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <p className="text-blue-700 text-2xl font-bold">
                        {company.allocated || 0}
                      </p>
                      <p className="text-xs text-blue-600 font-semibold mt-1">
                        🎯 Allocated
                      </p>
                    </div>

                    {/* Waiting */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200">
                      <p className="text-yellow-700 text-2xl font-bold">
                        {company.waiting || 0}
                      </p>
                      <p className="text-xs text-yellow-600 font-semibold mt-1">
                        ⏳ Waiting
                      </p>
                    </div>

                    {/* Rejected */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
                      <p className="text-red-700 text-2xl font-bold">
                        {company.rejected || 0}
                      </p>
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        ✗ Rejected
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-3"></div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-semibold">📋 Opportunities:</span> {company.total_opportunities}
                    </p>
                    <p>
                      <span className="font-semibold">💼 Total Vacancies:</span> {company.total_vacancies}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      👥 Total: {(company.accepted || 0) + (company.allocated || 0) + (company.waiting || 0)} Students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DETAIL VIEW: Show Students for Selected Company
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {allocatedData?.company_name || 'Company'} - Allocated Students
          </h2>
          <button
            onClick={() => {
              setSelectedCompany(null);
              setAllocatedData(null);
            }}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition shadow-md"
          >
            ← Back to Companies
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded mb-6">
            <p className="font-semibold">⚠️ Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading students...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Accepted Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 rounded-lg p-6 shadow-md">
                <p className="text-green-700 text-4xl font-bold">
                  {allocatedData?.total_accepted || 0}
                </p>
                <p className="text-sm text-green-600 font-semibold mt-2">✓ Accepted</p>
              </div>

              {/* Allocated Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-lg p-6 shadow-md">
                <p className="text-blue-700 text-4xl font-bold">
                  {allocatedData?.total_allocated || 0}
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-2">🎯 Allocated</p>
              </div>

              {/* Waiting Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-600 rounded-lg p-6 shadow-md">
                <p className="text-yellow-700 text-4xl font-bold">
                  {allocatedData?.total_waiting || 0}
                </p>
                <p className="text-sm text-yellow-600 font-semibold mt-2">⏳ Waiting</p>
              </div>

              {/* Total Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 rounded-lg p-6 shadow-md">
                <p className="text-purple-700 text-4xl font-bold">
                  {allocatedData?.total_students || 0}
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">👥 Total</p>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6 p-4">
              <div className="flex gap-2 border-b border-gray-200">
                {['Accepted', 'Allocated', 'Waiting'].map((status) => {
                  let count = 0;
                  if (status === 'Accepted') count = allocatedData?.total_accepted || 0;
                  else if (status === 'Allocated') count = allocatedData?.total_allocated || 0;
                  else if (status === 'Waiting') count = allocatedData?.total_waiting || 0;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => setExpandedStatus(status)}
                      className={`px-6 py-3 font-semibold transition text-sm ${
                        expandedStatus === status
                          ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderStudentTable(
                allocatedData?.status_groups[expandedStatus] || [],
                expandedStatus
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyAllocatedStudents;