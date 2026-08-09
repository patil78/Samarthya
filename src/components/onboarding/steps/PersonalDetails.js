import React, { useEffect } from 'react';

const PersonalDetails = ({ data, handleChange, handleFileChange, nextStep, prevStep }) => {

  // 🔥 Auto-fill mobile from localStorage
  useEffect(() => {
    const storedMobile = localStorage.getItem("mobile");

    if (storedMobile && !data.studentMobile) {
      handleChange({
        target: {
          name: "studentMobile",
          value: storedMobile
        }
      });
    }
  }, [data.studentMobile, handleChange]);

  // Form completion check
  const isFormComplete = 
    data.fullName && 
    data.studentMobile && 
    data.fatherName &&
    data.dob && 
    data.fatherMobile && 
    data.motherName && 
    data.motherMobile && 
    data.annualIncome;


    const handleNextClick = () => {
  if (!isFormComplete) {
    alert("Please fill all details");
    return;
  }

  // ✅ STEP UPDATE ONLY AFTER COMPLETE
  localStorage.setItem("onboardingStep", "resume");

  nextStep();
};

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Personal Details</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please provide your personal and family information.
      </p>
      
      <div className="space-y-6">

        {/* --- Student's Details --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={data.fullName || ''} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input 
              type="date" 
              name="dob" 
              value={data.dob || ''} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>

          {/* 🔥 UPDATED MOBILE FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Mobile Number
            </label>
            <input 
              type="tel" 
              name="studentMobile" 
              value={data.studentMobile || ''} 
              readOnly   // 🔒 LOCKED
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              This number is linked to your account and cannot be changed
            </p>
          </div>

        </div>

        {/* --- Parents' Details --- */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Parents' Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father's Name
              </label>
              <input 
                type="text" 
                name="fatherName" 
                value={data.fatherName || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father's Mobile Number
              </label>
              <input 
                type="tel" 
                name="fatherMobile" 
                value={data.fatherMobile || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mother's Name
              </label>
              <input 
                type="text" 
                name="motherName" 
                value={data.motherName || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mother's Mobile Number
              </label>
              <input 
                type="tel" 
                name="motherMobile" 
                value={data.motherMobile || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>

          </div>
        </div>
        
        {/* --- Income Details --- */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Income Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Annual Family Income (INR)
            </label>
            <input 
              type="text" 
              name="annualIncome" 
              placeholder="e.g., 500000" 
              value={data.annualIncome || ''} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
        </div>
      </div>


      {/* Buttons */}
      <div className="mt-8 flex justify-between">
        <button 
          onClick={prevStep} 
          className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
        >
          Back
        </button>

        <button 
          onClick={handleNextClick}
          disabled={!isFormComplete}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Verify and Proceed
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;