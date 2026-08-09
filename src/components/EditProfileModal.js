import React, { useState, useEffect } from 'react';

const EditProfileModal = ({ isOpen, onClose, userId, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Read-only user verification state
  const [accountInfo, setAccountInfo] = useState({
    email: '',
    mobile: '',
    aadhaar_number: '',
    is_verified: false,
    verified_age: '',
    resume_file: ''
  });

  // Comprehensive Editable Form State
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    dob: '',
    gender: '',
    father_name: '',
    father_mobile: '',
    mother_name: '',
    mother_mobile: '',
    annual_income: '',

    // Degree / Higher Education
    college_name: '',
    qualification: '',
    degree: '',
    branch: '',
    cgpa: '',
    grad_year: '',

    // 12th Education
    twelfth_school: '',
    twelfth_pct: '',
    twelfth_year: '',

    // 10th Education
    tenth_school: '',
    tenth_pct: '',
    tenth_year: '',

    // Skills & Preferences
    skills: '',
    location_pref1: '',
    location_pref2: '',
    location_pref3: '',
  });

  // Marksheet files
  const [marksheetFiles, setMarksheetFiles] = useState({
    degree_marksheet: null,
    twelfth_marksheet: null,
    tenth_marksheet: null,
  });

  // Fetch comprehensive student data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchStudentFullData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);


  const fetchStudentFullData = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`http://localhost:8000/student/data/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      
      // Set account & verification read-only info
      setAccountInfo({
        email: data.user?.email || 'N/A',
        mobile: data.user?.mobile || data.profile?.father_mobile || 'N/A',
        aadhaar_number: data.verification?.aadhaar_number || 'N/A',
        is_verified: !!data.verification?.is_verified,
        verified_age: data.verification?.aadhaar_age || 'N/A',
        resume_file: data.resume?.file_name || 'No resume uploaded'
      });

      // Populate full editable profile fields
      if (data.profile) {
        const p = data.profile;
        setFormData({
          name: p.name || '',
          dob: p.dob ? String(p.dob).split('T')[0] : '',
          gender: p.gender || '',
          father_name: p.father_name || '',
          father_mobile: p.father_mobile || '',
          mother_name: p.mother_name || '',
          mother_mobile: p.mother_mobile || '',
          annual_income: p.annual_income || '',

          college_name: p.college_name || '',
          qualification: p.qualification || '',
          degree: p.degree || '',
          branch: p.branch || '',
          cgpa: p.cgpa || '',
          grad_year: p.grad_year || '',

          twelfth_school: p.twelth_school || p.twelfth_school || '',
          twelfth_pct: p.twelth_pct || p.twelfth_pct || '',
          twelfth_year: p.twelth_year || p.twelfth_year || '',

          tenth_school: p.tenth_school || '',
          tenth_pct: p.tenth_pct || '',
          tenth_year: p.tenth_year || '',

          skills: p.skills || '',
          location_pref1: p.location_pref1 || '',
          location_pref2: p.location_pref2 || '',
          location_pref3: p.location_pref3 || '',
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Could not load complete profile data from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setMarksheetFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Re-upload resume & re-run parsing
  const handleResumeReupload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setError('');
    setSuccessMsg('');

    const resumeFormData = new FormData();
    resumeFormData.append('file', file);

    try {
      // 1. Upload new resume to backend
      const uploadRes = await fetch(`http://localhost:8000/upload/resume/${userId}`, {
        method: 'POST',
        body: resumeFormData,
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadResult.detail || 'Resume upload failed');
      }

      setAccountInfo(prev => ({ ...prev, resume_file: file.name }));

      // 2. Trigger Full Parse of New Resume
      try {
        const parseRes = await fetch(`http://localhost:8000/student/${userId}/parse-resume-full`);
        if (parseRes.ok) {
          const parseResult = await parseRes.json();
          console.log("Re-parsed resume data:", parseResult);

          const extractedSkills = parseResult.skills?.skills_string || 
            (parseResult.skills?.array ? parseResult.skills.array.join(', ') : '');

          const extractedEdu = parseResult.education || {};

          // Auto-update form values with newly parsed skills & education info
          setFormData(prev => ({
            ...prev,
            skills: extractedSkills || prev.skills,
            college_name: extractedEdu.college_name || prev.college_name,
            degree: extractedEdu.degree || prev.degree,
            branch: extractedEdu.branch || prev.branch,
            cgpa: extractedEdu.cgpa || prev.cgpa,
            twelfth_school: extractedEdu.twelth_school || prev.twelfth_school,
            tenth_school: extractedEdu.tenth_school || prev.tenth_school,
          }));

          setSuccessMsg(`🎉 Resume uploaded & parsed successfully! Extracted ${parseResult.skills?.count || 0} skills and autofilled profile fields.`);
        } else {
          setSuccessMsg("✅ New resume uploaded successfully!");
        }
      } catch (parseErr) {
        console.warn("Resume parsing warning:", parseErr);
        setSuccessMsg("✅ New resume uploaded successfully!");
      }

    } catch (err) {
      console.error("Error uploading resume:", err);
      setError(err.message || "Failed to upload new resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    const profileFormData = new FormData();
    profileFormData.append('name', formData.name);
    profileFormData.append('dob', formData.dob);
    profileFormData.append('gender', formData.gender);
    profileFormData.append('father_name', formData.father_name);
    profileFormData.append('father_mobile', formData.father_mobile);
    profileFormData.append('mother_name', formData.mother_name);
    profileFormData.append('mother_mobile', formData.mother_mobile);
    profileFormData.append('annual_income', formData.annual_income);

    profileFormData.append('college_name', formData.college_name);
    profileFormData.append('qualification', formData.qualification);
    profileFormData.append('degree', formData.degree);
    profileFormData.append('branch', formData.branch);
    profileFormData.append('skills', formData.skills);
    if (formData.cgpa) profileFormData.append('cgpa', formData.cgpa);
    if (formData.grad_year) profileFormData.append('grad_year', formData.grad_year);

    profileFormData.append('twelfth_school', formData.twelfth_school);
    if (formData.twelfth_pct) profileFormData.append('twelfth_pct', formData.twelfth_pct);
    if (formData.twelfth_year) profileFormData.append('twelfth_year', formData.twelfth_year);

    profileFormData.append('tenth_school', formData.tenth_school);
    if (formData.tenth_pct) profileFormData.append('tenth_pct', formData.tenth_pct);
    if (formData.tenth_year) profileFormData.append('tenth_year', formData.tenth_year);

    profileFormData.append('location_pref1', formData.location_pref1);
    profileFormData.append('location_pref2', formData.location_pref2);
    profileFormData.append('location_pref3', formData.location_pref3);

    // Append marksheet files if selected
    if (marksheetFiles.degree_marksheet) {
      profileFormData.append('degree_marksheet', marksheetFiles.degree_marksheet);
    }
    if (marksheetFiles.twelfth_marksheet) {
      profileFormData.append('twelfth_marksheet', marksheetFiles.twelfth_marksheet);
    }
    if (marksheetFiles.tenth_marksheet) {
      profileFormData.append('tenth_marksheet', marksheetFiles.tenth_marksheet);
    }

    try {
      // 1. Submit updated profile to backend
      const response = await fetch(`http://localhost:8000/student/profile/${userId}`, {
        method: 'POST',
        body: profileFormData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to update full profile');
      }

      // 2. Trigger score recalculation
      try {
        await fetch(`http://localhost:8000/student/${userId}/calculate-scores`, {
          method: 'POST',
        });
      } catch (scoreErr) {
        console.warn("Score recalculation warning:", scoreErr);
      }

      setSuccessMsg("✅ Full Profile updated and saved successfully!");
      if (onProfileUpdated) {
        onProfileUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-5 flex justify-between items-center text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Complete Student Profile</h2>
              <p className="text-xs text-indigo-100">Upload new resume, re-parse skills, and update all profile details</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-indigo-100 hover:text-white transition-colors focus:outline-none text-3xl font-light"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-indigo-50 border-b border-indigo-100 flex overflow-x-auto px-6 pt-3 space-x-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2.5 px-4 rounded-t-lg border-b-2 transition-all ${
              activeTab === 'account'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-indigo-600'
            }`}
          >
            📄 Resume & Account
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2.5 px-4 rounded-t-lg border-b-2 transition-all ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-indigo-600'
            }`}
          >
            👤 Personal & Family
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            className={`py-2.5 px-4 rounded-t-lg border-b-2 transition-all ${
              activeTab === 'academics'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-indigo-600'
            }`}
          >
            🎓 Education & Marksheets
          </button>
          <button
            onClick={() => setActiveTab('skills_prefs')}
            className={`py-2.5 px-4 rounded-t-lg border-b-2 transition-all ${
              activeTab === 'skills_prefs'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-indigo-600'
            }`}
          >
            ⚡ Skills & Preferences
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="text-gray-500 mt-4 font-medium text-sm">Fetching complete profile details from server...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-lg flex items-center space-x-2">
                <span>⚠️ {error}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm rounded-lg flex items-center space-x-2">
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: Resume & Account Details */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Resume Re-upload Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-md font-bold text-indigo-900 flex items-center space-x-2">
                        <span>📄 Re-upload & Parse Resume</span>
                      </h3>
                      <p className="text-xs text-indigo-700 mt-1">
                        Upload a new PDF/DOCX resume to trigger automatic AI parsing for skills and academic autofill.
                      </p>
                    </div>
                    <span className="text-xs bg-indigo-200 text-indigo-800 font-bold px-2.5 py-1 rounded-full">
                      Auto-parsing Enabled
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                    <label className="w-full sm:w-auto flex-1 cursor-pointer flex items-center justify-center px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl bg-white hover:bg-indigo-50/50 transition-all text-center">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleResumeReupload}
                        disabled={uploadingResume}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold text-indigo-600 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{uploadingResume ? 'Uploading & Parsing...' : 'Choose New Resume File'}</span>
                      </span>
                    </label>
                    
                    <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200 w-full sm:w-auto">
                      <strong>Current File:</strong>
                      <p className="font-semibold text-indigo-900 truncate max-w-[200px]">{accountInfo.resume_file}</p>
                    </div>
                  </div>

                  {uploadingResume && (
                    <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-indigo-700 font-semibold animate-pulse">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      <span>Extracting text & parsing skills from new resume...</span>
                    </div>
                  )}
                </div>

                {/* Account Details */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold block">Account Email</span>
                    <p className="font-semibold text-gray-800">{accountInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold block">Student Mobile</span>
                    <p className="font-semibold text-gray-800">{accountInfo.mobile}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold block">Aadhaar Number</span>
                    <p className="font-semibold text-gray-800">{accountInfo.aadhaar_number}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold block">Aadhaar Verification Status</span>
                    <p className="font-semibold flex items-center mt-0.5">
                      {accountInfo.is_verified ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-bold">✅ Verified (Eligible Age: {accountInfo.verified_age})</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full font-bold">⏳ Verification Pending</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Personal & Family Details */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Annual Family Income (INR)</label>
                      <input
                        type="text"
                        name="annual_income"
                        placeholder="e.g. ₹ 3,00,000"
                        value={formData.annual_income}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Family Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Father's Name</label>
                      <input
                        type="text"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Father's Mobile Number</label>
                      <input
                        type="tel"
                        name="father_mobile"
                        value={formData.father_mobile}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mother's Name</label>
                      <input
                        type="text"
                        name="mother_name"
                        value={formData.mother_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mother's Mobile Number</label>
                      <input
                        type="tel"
                        name="mother_mobile"
                        value={formData.mother_mobile}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Academic Details & Marksheets */}
            {activeTab === 'academics' && (
              <div className="space-y-6">
                {/* Degree / College */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Degree / Higher Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">College / University Name</label>
                      <input
                        type="text"
                        name="college_name"
                        value={formData.college_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Qualification Level</label>
                      <input
                        type="text"
                        name="qualification"
                        placeholder="e.g. Undergraduate / Postgraduate"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Degree Name</label>
                      <input
                        type="text"
                        name="degree"
                        placeholder="e.g. B.Tech / B.Sc"
                        value={formData.degree}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Branch / Specialization</label>
                      <input
                        type="text"
                        name="branch"
                        placeholder="e.g. Computer Science"
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">CGPA / Percentage</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cgpa"
                        placeholder="e.g. 8.5"
                        value={formData.cgpa}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Graduation Year</label>
                      <input
                        type="number"
                        name="grad_year"
                        placeholder="e.g. 2025"
                        value={formData.grad_year}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Upload/Update Degree Marksheet</label>
                      <input
                        type="file"
                        name="degree_marksheet"
                        onChange={handleFileChange}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                {/* 12th Grade */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">12th Grade / Senior Secondary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">School / Junior College</label>
                      <input
                        type="text"
                        name="twelfth_school"
                        value={formData.twelfth_school}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="twelfth_pct"
                        placeholder="e.g. 85.5"
                        value={formData.twelfth_pct}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Passing Year</label>
                      <input
                        type="number"
                        name="twelfth_year"
                        placeholder="e.g. 2021"
                        value={formData.twelfth_year}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Upload/Update 12th Marksheet</label>
                      <input
                        type="file"
                        name="twelfth_marksheet"
                        onChange={handleFileChange}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                {/* 10th Grade */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">10th Grade / Secondary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">School Name</label>
                      <input
                        type="text"
                        name="tenth_school"
                        value={formData.tenth_school}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="tenth_pct"
                        placeholder="e.g. 90.0"
                        value={formData.tenth_pct}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Passing Year</label>
                      <input
                        type="number"
                        name="tenth_year"
                        placeholder="e.g. 2019"
                        value={formData.tenth_year}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Upload/Update 10th Marksheet</label>
                      <input
                        type="file"
                        name="tenth_marksheet"
                        onChange={handleFileChange}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Skills & Preferences */}
            {activeTab === 'skills_prefs' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Key Skills</h3>
                    <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleResumeReupload}
                        disabled={uploadingResume}
                        className="sr-only"
                      />
                      <span>⚡ Re-parse from New Resume</span>
                    </label>
                  </div>
                  <div>
                    <textarea
                      rows="4"
                      name="skills"
                      placeholder="e.g. Python, React, Data Analysis, Machine Learning, Communication"
                      value={formData.skills}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Extracted skills are parsed from your uploaded resume. You can edit, add, or refine skills manually here.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Preferred Work Locations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Location Preference 1</label>
                      <input
                        type="text"
                        name="location_pref1"
                        placeholder="e.g. Bangalore"
                        value={formData.location_pref1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Location Preference 2</label>
                      <input
                        type="text"
                        name="location_pref2"
                        placeholder="e.g. Mumbai"
                        value={formData.location_pref2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Location Preference 3</label>
                      <input
                        type="text"
                        name="location_pref3"
                        placeholder="e.g. Pune"
                        value={formData.location_pref3}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Clicking <strong className="text-gray-700">Save All Changes</strong> updates your profile & recalculates matching scores.
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploadingResume}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || loading || uploadingResume}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-400 text-sm flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving All Changes...
                </>
              ) : 'Save All Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;
