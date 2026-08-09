import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from './EditProfileModal';

const ApplicationStatusDashboard = ({ studentData }) => {
  const { logout, user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userId = user?.id || JSON.parse(localStorage.getItem('user'))?.id;

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      if (!userId) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/student/${userId}/preferences`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched preferences:', data);
        setPreferences(data.preferences || []);
      } else {
        console.error('Failed to fetch preferences');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  // Fetch matched offers from allocation
  const fetchMatchedOffers = async () => {
    try {
      if (!userId) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/student/${userId}/matched-offers`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched matched offers:', data);
        setOffers(data.offers || []);
      } else {
        console.error('Failed to fetch matched offers');
      }
    } catch (error) {
      console.error('Error fetching matched offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
    fetchMatchedOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);


  const handleProfileUpdated = () => {
    fetchPreferences();
    fetchMatchedOffers();
  };

  // --- Reusable Sub-Components ---

  const PreferenceCard = ({ preference, index }) => (
    <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-bold text-gray-700">Preference {index + 1}</p>
        <p className="text-sm"><strong>Sector:</strong> {preference.sector?.label || 'N/A'}</p>
        <p className="text-sm"><strong>Role:</strong> {preference.role?.label || 'N/A'}</p>
        <p className="text-sm"><strong>Location:</strong> {preference.location?.label || 'N/A'}</p>
    </div>
  );

  const OfferCard = ({ offer }) => {
    // Determine status badge color
    const getStatusBadge = (status) => {
      switch(status) {
        case 'Accepted':
          return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">✅ Accepted</span>;
        case 'Allocated':
          return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">🎯 Allocated</span>;
        case 'Waiting':
          return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">⏳ Waitlist</span>;
        default:
          return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">{status}</span>;
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-lg text-gray-800">{offer.role}</h4>
            <p className="text-gray-600 text-sm">{offer.company}</p>
          </div>
          {getStatusBadge(offer.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-gray-500">Sector:</span>
            <p className="font-medium text-gray-700">{offer.sector}</p>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="font-medium text-gray-700">{offer.location}</p>
          </div>
          <div>
            <span className="text-gray-500">Stipend:</span>
            <p className="font-medium text-green-600">{offer.salary}</p>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <p className="font-medium text-gray-700">{offer.duration}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-sm">
            <span className="text-gray-500">Match Score: </span>
            <span className="font-bold text-indigo-600">{offer.score}%</span>
          </div>
          
          {offer.status === 'Allocated' && (
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              📧 Check your email to accept/reject
            </div>
          )}
          
          {offer.status === 'Waiting' && (
            <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
              ⏳ You're on the waitlist
            </div>
          )}

          {offer.status === 'Accepted' && (
            <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
              ✅ Offer Accepted
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Main Component Return ---

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Application Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your student profile, view preferences, and check matched internship offers.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 bg-white text-indigo-600 border border-indigo-200 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Profile</span>
          </button>
          <button onClick={logout} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Preferences */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-700">Your Submitted Preferences</h2>
            </div>
            <div className="space-y-4">
              {preferences.length > 0 ? (
                preferences.map((pref, index) => <PreferenceCard key={index} preference={pref} index={index} />)
              ) : <p className="text-gray-500">No preferences submitted.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Matched Offers */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Matched Offers</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center p-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-500 mt-2">Loading matched offers...</p>
                </div>
              ) : offers.length > 0 ? (
                offers.map(offer => <OfferCard key={offer.id} offer={offer} />)
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">You have no matched offers at this time.</p>
                  <p className="text-sm text-gray-400 mt-2">Offers will appear here once the allocation process is completed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Overlay Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={userId}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

export default ApplicationStatusDashboard;