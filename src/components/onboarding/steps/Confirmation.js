import React from 'react';

const Confirmation = ({ data, prevStep, handleSubmit }) => {

  // Helper component to display each education block
  const EducationDetail = ({ title, details }) => {
    // Don't render the section at all if there's no data for it
    if (!details || Object.keys(details).length === 0) return null;
    
    return (
      <div className="mt-2">
        <p className="font-semibold">{title}:</p>
        <p className="text-sm pl-2">Qualification: {details.qualification?.label || 'N/A'}</p>
        <p className="text-sm pl-2">School/College: {details.college_name || 'N/A'}</p>
        <p className="text-sm pl-2">Address: {details.address || 'N/A'}</p>
        <p className="text-sm pl-2">Degree/Board: {details.degree || 'N/A'}</p>
        {details.branch && <p className="text-sm pl-2">Branch/Stream: {details.branch}</p>}
        <p className="text-sm pl-2">CGPA/%: {details.cgpa || 'N/A'}</p>
        <p className="text-sm pl-2">Passing Year: {details.passing_year || 'N/A'}</p>
        <p className="text-sm pl-2 font-medium text-indigo-800">Marksheet: {details.marksheet?.name || 'Not uploaded'}</p>
      </div>
    );
  };

  // Helper component to display each preference block
  const PreferenceDetail = ({ title, details }) => {
    // Don't render the section if no sector was chosen
    if (!details || !details.sector) return null;
    
    return (
      <div className="mt-2 text-sm">
        <p className="font-semibold text-base">{title}:</p>
        <p className="pl-2"><strong>Sector:</strong> {details.sector.label}</p>
        <p className="pl-2"><strong>Role:</strong> {details.role.label}</p>
        <p className="pl-2"><strong>Location:</strong> {details.location?.label || 'N/A'}</p>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Confirm Your Details</h2>
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg border text-sm text-gray-800">
        
        {/* --- Aadhaar Verification Section --- */}
        <div>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Aadhaar Verification</h3>
          <p><strong>Aadhaar Number:</strong> {data.aadhaar || 'Not provided'}</p>
        </div>
        
        {/* --- Personal & Family Details Section --- */}
        <div>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Personal & Family Details</h3>
          <p><strong>Full Name:</strong> {data.fullName || 'Not provided'}</p>
          <p><strong>Mobile Number:</strong> {data.studentMobile || 'Not provided'}</p>
          <p><strong>Father's Name:</strong> {data.fatherName || 'Not provided'}</p>
          <p><strong>Father's Mobile:</strong> {data.fatherMobile || 'Not provided'}</p>
          <p><strong>Mother's Name:</strong> {data.motherName || 'Not provided'}</p>
          <p><strong>Mother's Mobile:</strong> {data.motherMobile || 'Not provided'}</p>
          <p><strong>Annual Income:</strong> ₹ {data.annualIncome || 'Not provided'}</p>
          <p><strong>Income Certificate:</strong> {data.incomeCertificate?.name || 'Not provided'}</p>
        </div>

        {/* --- Resume and Education Section --- */}
        <div>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Resume and Education</h3>
          <p><strong>Resume File:</strong> {data.resumeDetails?.resumeFile?.name || 'Not provided'}</p>
          <p><strong>Full Name (from resume):</strong> {data.resumeDetails?.fullName || 'N/A'}</p>
          
          {/* Parsed Skills Display */}
          <div className="mt-2">
            <p className="font-semibold">Parsed Skills:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.resumeDetails?.parsedSkills?.length > 0 ? (
                data.resumeDetails.parsedSkills.map(skill => (
                  <span key={skill} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                ))
              ) : (
                <p className="text-gray-500 pl-2">No skills parsed.</p>
              )}
            </div>
          </div>
          
          <EducationDetail title="Degree" details={data.resumeDetails?.education?.degree} />
          <EducationDetail title="12th / Diploma" details={data.resumeDetails?.education?.twelfth} />
          <EducationDetail title="10th Grade" details={data.resumeDetails?.education?.tenth} />
        </div>

        {/* --- Job Preferences Section --- */}
        <div>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Job Preferences</h3>
          {data.preferences && data.preferences.filter(p => p.sector).length > 0 ? (
            data.preferences.map((pref, index) => (
              <PreferenceDetail key={index} title={`Preference ${index + 1}`} details={pref} />
            ))
          ) : (
            <p className="text-sm text-gray-500">No job preferences were specified.</p>
          )}
        </div>
        
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Back</button>
        <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700">Submit Application</button>
      </div>
    </div>
  );
};

export default Confirmation;