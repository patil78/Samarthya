import React, { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import StudentOnboarding from 'components/onboarding/StudentOnboarding';
import ApplicationStatusDashboard from 'components/ApplicationStatusDashboard';

const StudentArea = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // To show a loading message

  // This effect runs once when the component loads
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Check if the user has a completed profile on the backend
        const statusResponse = await fetch(`http://127.0.0.1:8000/student/${user.id}/onboarding-status`);
        const statusData = await statusResponse.json();

        if (statusData.onboarding_complete) {
          // 2. If complete, fetch the dashboard data (preferences and offers)
          const dashboardResponse = await fetch(`http://127.0.0.1:8000/student/${user.id}/dashboard`);
          const dashboardData = await dashboardResponse.json();
          
          setStudentData(dashboardData);
          setIsOnboardingComplete(true);
        }
        // If not complete, isOnboardingComplete remains false, and the form will be shown.

      } catch (error) {
        console.error("Failed to fetch student status:", error);
      } finally {
        setIsLoading(false); // Stop loading, whether successful or not
      }
    };

    checkOnboardingStatus();
  }, [user]); // Re-run if the user object changes

  const handleOnboardingComplete = (finalFormData) => {
    // When the form is submitted, we can construct the data needed for the dashboard
    // and switch the view without needing a page reload.
    setStudentData({
        preferences: finalFormData.preferences,
        offers: [] // Initially, there are no offers right after submission
    });
    setIsOnboardingComplete(true);
  };

  // Show a loading screen while we check the user's status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div>
      {isOnboardingComplete ? (
        // If onboarding is complete, show the dashboard
        <ApplicationStatusDashboard studentData={studentData} />
      ) : (
        // Otherwise, show the multi-step onboarding form
        <StudentOnboarding onOnboardingComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default StudentArea;

