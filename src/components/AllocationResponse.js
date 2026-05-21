import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

const AllocationResponse = () => {
  const { action, allocation_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [allocation, setAllocation] = useState(null);

  useEffect(() => {
    handleAllocationResponse();
  }, []);

  const handleAllocationResponse = async () => {
    try {
      setLoading(true);

      // First check the current status
      const statusResponse = await axios.get(
        `${API_BASE_URL}/student/allocation/${allocation_id}/status`
      );
      setAllocation(statusResponse.data);

      // Make the accept/reject request
      const endpoint =
        action === 'accept'
          ? `/student/allocation/${allocation_id}/accept`
          : `/student/allocation/${allocation_id}/reject`;

      const response = await axios.post(`${API_BASE_URL}${endpoint}`);

      console.log('✅ Response:', response.data);

      setMessage(response.data.message);
      setError('');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 3000);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(
        err.response?.data?.detail ||
          `Failed to ${action} allocation. Please try again.`
      );
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Processing your response...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">
              {action === 'accept' ? '✅' : '✋'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {action === 'accept' ? 'Offer Accepted!' : 'Offer Rejected'}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {allocation && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-600">
                  <strong>Company:</strong> {allocation.company_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Position:</strong> {allocation.role}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{' '}
                  <span
                    className={`font-bold ${
                      allocation.status === 'Accepted'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {allocation.status}
                  </span>
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard in 3 seconds...
            </p>

            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to Dashboard Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationResponse;