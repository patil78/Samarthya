import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 

import ProgressBar from './ProgressBar';
import AadhaarVerification from './steps/AadhaarVerification';
import PersonalDetails from './steps/PersonalDetails';
import UploadResume from './steps/UploadResume';
import LocationPreference from './steps/LocationPreference';
import Confirmation from './steps/Confirmation';

const TOTAL_STEPS = 5;

const StudentOnboarding = ({ onOnboardingComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    // This log helps you see the complete data object as it's being built
    console.log("Form data has been updated:", formData);
  }, [formData]);

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
    if (!user || !user.id) {
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
        const response = await fetch(`http://127.0.0.1:8000/student/${user.id}/personal-details`, {
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
  if (!user || !user.id) {
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
      const profileResponse = await fetch(`http://127.0.0.1:8000/student/profile/${user.id}`, {
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
          
          const preferencesResponse = await fetch(`http://127.0.0.1:8000/student/${user.id}/preferences`, {
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
              const scoresResponse = await fetch(`http://127.0.0.1:8000/student/${user.id}/calculate-scores`, {
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
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        {renderStep()}
      </div>
    </div>
  );
};

export default StudentOnboarding;