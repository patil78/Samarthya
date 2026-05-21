import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

import ProgressBar from './ProgressBar';
import AadhaarVerification from './steps/AadhaarVerification';
import PersonalDetails from './steps/PersonalDetails';
import UploadResume from './steps/UploadResume';
import LocationPreference from './steps/LocationPreference';
import Confirmation from './steps/Confirmation';

const TOTAL_STEPS = 5;

const StudentOnboarding = ({ onOnboardingComplete }) => {
  const { userId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ✅ Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setLoading(true);
        
        // Use userId from params, fallback to user.id from context
        const uid = userId || user?.id;
        if (!uid) {
          console.error("❌ No user ID found");
          return;
        }

        console.log(`🔍 Checking onboarding status for user_id: ${uid}`);
        
        const response = await fetch(`http://127.0.0.1:8000/student/${uid}/onboarding-status`);
        const data = await response.json();
        
        console.log("✅ Onboarding status:", data);
        
        // ✅ If profile already exists, skip to step 3 (Resume Upload)
        if (data.onboarding_complete) {
          console.log("📝 Profile exists, starting from Resume Upload (Step 3)");
          setCurrentStep(3);
        } else {
          console.log("📝 No profile found, starting from Aadhaar Verification (Step 1)");
          setCurrentStep(1);
        }
      } catch (error) {
        console.error("❌ Error checking onboarding status:", error);
        setCurrentStep(1); // Default to step 1
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [userId, user?.id]);

  useEffect(() => {
    // This log helps you see the complete data object as it's being built
    console.log("Form data has been updated:", formData);
  }, [formData]);

  // ✅ Helper function to get user ID (prioritize userId from params)
  const getCurrentUserId = () => userId || user?.id;

  // ✅ Fetch user's mobile number from backend and auto-fill
  useEffect(() => {
    const fetchUserMobile = async () => {
      try {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;

        console.log(`📱 Fetching mobile for user_id: ${currentUserId}`);
        
        const response = await fetch(`http://127.0.0.1:8000/student/${currentUserId}/details`);
        const data = await response.json();
        
        if (response.ok && data.mobile) {
          console.log(`✅ Mobile fetched: ${data.mobile}`);
          // Auto-fill the mobile number
          setFormData(prev => ({
            ...prev,
            studentMobile: data.mobile
          }));
        }
      } catch (error) {
        console.error("❌ Error fetching mobile number:", error);
      }
    };

    fetchUserMobile();
  }, [userId, user?.id]);

  const nextStep = () => setCurrentStep(prev => (prev < TOTAL_STEPS ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };
  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalDetailsSubmit = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
        alert("Authentication error: User not found. Please log in again.");
        return;
    }

    const detailsFormData = new FormData();
    detailsFormData.append('aadhaar_number', formData.aadhaar);
    detailsFormData.append('dob', formData.dob);
    detailsFormData.append('fullName', formData.fullName);
    detailsFormData.append('studentMobile', formData.studentMobile);
    detailsFormData.append('fatherName', formData.fatherName);
    detailsFormData.append('fatherMobile', formData.fatherMobile);
    detailsFormData.append('motherName', formData.motherName);
    detailsFormData.append('motherMobile', formData.motherMobile);
    detailsFormData.append('annualIncome', formData.annualIncome);
    detailsFormData.append('incomeCertificate', formData.incomeCertificate);

    try {
        const response = await fetch(`http://127.0.0.1:8000/student/${currentUserId}/personal-details`, {
            method: 'POST',
            body: detailsFormData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.detail || 'Failed to save personal details.');
        }

        console.log(result.message);
        nextStep();

    } catch (error) {
        console.error("Error submitting personal details:", error);
        alert(`Submission Failed: ${error.message}`);
    }
  };

// --- FINAL SUBMISSION LOGIC ---
const handleSubmit = async () => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
      alert("Authentication error: User not found.");
      return;
  }

  const { resumeDetails, dob, preferences } = formData;
  const { education, fullName, skills } = resumeDetails || { education: {} };
  
  const profileData = new FormData();
  
  // Basic Info
  profileData.append('name', fullName || '');
  profileData.append('dob', dob || '');
  
  // Skills - Convert from CreatableSelect format to comma-separated string
  if (skills && skills.length > 0) {
    const skillsString = skills.map(skill => skill.label || skill.value).join(', ');
    profileData.append('skills', skillsString);
    console.log("📋 Submitting skills:", skillsString);
  }

  // Degree Info
  profileData.append('college_name', education.degree?.college_name || '');
  profileData.append('degree', education.degree?.degree || '');
  profileData.append('qualification', education.degree?.qualification?.value || '');
  profileData.append('branch', education.degree?.branch || '');
  profileData.append('cgpa', education.degree?.cgpa || 0);
  profileData.append('grad_year', education.degree?.passing_year || 0);
  
  // 12th Info
  profileData.append('twelfth_school', education.twelfth?.college_name || '');
  profileData.append('twelfth_pct', (education.twelfth?.cgpa || '0').replace('%', ''));
  profileData.append('twelfth_year', education.twelfth?.passing_year || 0);
  
  // 10th Info
  profileData.append('tenth_school', education.tenth?.college_name || '');
  profileData.append('tenth_pct', (education.tenth?.cgpa || '0').replace('%', ''));
  profileData.append('tenth_year', education.tenth?.passing_year || 0);

  // Location Preferences
  profileData.append('location_pref1', preferences?.[0]?.location?.label || null);
  profileData.append('location_pref2', preferences?.[1]?.location?.label || null);
  profileData.append('location_pref3', preferences?.[2]?.location?.label || null);

  // Append marksheet files if they exist
  if (education.degree?.marksheet) {
    profileData.append('degree_marksheet', education.degree.marksheet);
  }
  if (education.twelfth?.marksheet) {
    profileData.append('twelfth_marksheet', education.twelfth.marksheet);
  }
  if (education.tenth?.marksheet) {
    profileData.append('tenth_marksheet', education.tenth.marksheet);
  }

  try {
      // ===== STEP 1: Save the profile and files =====
      const profileResponse = await fetch(`http://127.0.0.1:8000/student/profile/${currentUserId}`, {
          method: 'POST',
          body: profileData,
      });

      const profileResult = await profileResponse.json();
      if (!profileResponse.ok) {
          throw new Error(profileResult.detail || "Failed to submit profile.");
      }

      console.log("Profile Submission Response:", profileResult);

      // ===== STEP 2: Save the preferences =====
      // Filter out empty preferences (only send filled ones)
      const filledPreferences = (preferences || []).filter(
        pref => pref.sector && pref.role && pref.location
      );

      if (filledPreferences.length > 0) {
          console.log("Submitting preferences:", filledPreferences);
          
          const preferencesResponse = await fetch(`http://127.0.0.1:8000/student/${currentUserId}/preferences`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ preferences: filledPreferences })
          });

          const preferencesResult = await preferencesResponse.json();
          if (!preferencesResponse.ok) {
              console.error("Failed to save preferences:", preferencesResult);
              throw new Error(preferencesResult.detail || "Failed to submit preferences.");
          }

          console.log("Preferences Submission Response:", preferencesResult);
          
          // ===== STEP 3: Calculate allocation scores =====
          console.log("Calculating allocation scores...");
          try {
              const scoresResponse = await fetch(`http://127.0.0.1:8000/student/${currentUserId}/calculate-scores`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });

              if (scoresResponse.ok) {
                  const scoresResult = await scoresResponse.json();
                  console.log("✅ Scores calculated successfully:", scoresResult);
                  console.log(`Profile ID: ${scoresResult.profile_id}, User ID: ${scoresResult.user_id}`);
              } else {
                  const errorData = await scoresResponse.json();
                  console.error("❌ Score calculation failed:", errorData);
                  console.error("Response status:", scoresResponse.status);
                  // Show alert to user about calculation failure
                  alert("Warning: Score calculation failed. Please contact administrator or try manual calculation.");
              }
          } catch (scoreError) {
              console.error("❌ Score calculation error:", scoreError);
              console.error("Error details:", scoreError.message);
              // Show alert to user
              alert("Warning: Could not calculate scores. Backend might be offline. Please contact administrator.");
              // Don't fail the entire submission if score calculation fails
          }
      } else {
          console.log("No preferences to submit");
      }

      alert("Onboarding completed successfully! Profile, preferences, and allocation scores saved.");
      onOnboardingComplete(formData); // This triggers the redirect to the final dashboard

  } catch (error) {
      console.error("Final submission error:", error);
      alert(`Error: ${error.message}`);
  }
};

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AadhaarVerification data={formData} handleChange={handleChange} nextStep={nextStep} />;
      case 2:
        return <PersonalDetails data={formData} handleChange={handleChange} handleFileChange={handleFileChange} nextStep={handlePersonalDetailsSubmit} prevStep={prevStep} />;
      case 3:
        return <UploadResume data={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} userId={user?.id} />;
      case 4:
        return <LocationPreference data={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 5:
        return <Confirmation data={formData} handleSubmit={handleSubmit} prevStep={prevStep} />;
      default:
        return <div>Form complete!</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        {/* ✅ Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading onboarding information...</p>
          </div>
        ) : (
          <>
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            {renderStep()}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentOnboarding;