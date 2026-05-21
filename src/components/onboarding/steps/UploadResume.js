import React, { useState } from 'react';
import EducationSection from './subcomponents/EducationSection';
import CreatableSelect from 'react-select/creatable';

const UploadResume = ({ data, updateFormData, nextStep, prevStep, userId }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [isParsingSkills, setIsParsingSkills] = useState(false);
  
  const [localData, setLocalData] = useState(data.resumeDetails || {
    resumeFile: null,
    fullName: '',
    parsedSkills: [],
    skills: [], // Selected skills for submission
    education: { tenth: {}, twelfth: {}, degree: {} }
  });

  const isFormComplete = 
    localData.resumeFile &&
    localData.education.tenth?.address &&
    localData.education.tenth?.degree &&
    localData.education.tenth?.marksheet;

  const handleResumeUpload = async (file) => {
    if (!userId) {
        setError("User not logged in. Cannot upload resume.");
        return;
    }
    setError('');
    setIsParsing(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`http://127.0.0.1:8000/upload/resume/${userId}`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to parse resume.');

        console.log("Backend Response:", result);

        setLocalData(prev => ({
            ...prev,
            fullName: result.autofill?.name || '',
            parsedSkills: result.parsed_skills || [],
        }));
        
        // After basic parsing, parse skills automatically
        parseSkillsFromResume();
        
    } catch (err) {
        setError(err.message);
    } finally {
        setIsParsing(false);
    }
  };

  const parseSkillsFromResume = async () => {
    if (!userId) {
        console.log("No userId available for skills parsing");
        return;
    }
    
    setIsParsingSkills(true);
    
    try {
        // Use the comprehensive parsing endpoint
        const response = await fetch(`http://127.0.0.1:8000/student/${userId}/parse-resume-full`);
        
        if (!response.ok) {
            throw new Error('Failed to parse resume');
        }
        
        const result = await response.json();
        console.log("✅ Full resume parsed:", result);
        
        // Convert skills array to CreatableSelect format
        const skillsOptions = result.skills.array.map(skill => ({
            value: skill,
            label: skill
        }));
        
        // Prepare education data from parsed resume
        const educationData = {
            tenth: {
                address: result.education.tenth_school || '',
                degree: '10th',
                cgpa: result.education.tenth_pct ? `${result.education.tenth_pct}%` : '',
                passing_year: '',
                marksheet: localData.education.tenth?.marksheet || null
            },
            twelfth: {
                address: result.education.twelth_school || '',
                degree: '12th',
                cgpa: result.education.twelth_pct ? `${result.education.twelth_pct}%` : '',
                passing_year: '',
                marksheet: localData.education.twelfth?.marksheet || null
            },
            degree: {
                college_name: result.education.college_name || '',
                degree: result.education.degree || '',
                branch: result.education.branch || '',
                qualification: result.education.qualification ? { 
                    value: result.education.qualification, 
                    label: result.education.qualification 
                } : null,
                cgpa: result.education.cgpa || '',
                passing_year: result.education.grad_year || '',
                marksheet: localData.education.degree?.marksheet || null
            }
        };
        
        setLocalData(prev => ({
            ...prev,
            parsedSkills: result.skills.array,
            skills: skillsOptions, // Pre-populate selected skills
            education: educationData // Auto-fill education sections
        }));
        
        // Show success message
        if (result.skills.count > 0 || Object.keys(result.education).length > 0) {
            console.log(`🎉 Auto-filled: ${result.skills.count} skills and education details!`);
        }
        
    } catch (err) {
        console.error("Resume parsing error:", err);
        // Fallback to skills-only parsing if full parsing fails
        try {
            const fallbackResponse = await fetch(`http://127.0.0.1:8000/student/${userId}/parse-resume-skills`);
            if (fallbackResponse.ok) {
                const fallbackResult = await fallbackResponse.json();
                const skillsOptions = fallbackResult.skills.map(skill => ({
                    value: skill,
                    label: skill
                }));
                setLocalData(prev => ({
                    ...prev,
                    parsedSkills: fallbackResult.skills,
                    skills: skillsOptions
                }));
            }
        } catch (fallbackErr) {
            console.error("Fallback parsing also failed:", fallbackErr);
        }
    } finally {
        setIsParsingSkills(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalData(prev => ({...prev, resumeFile: file}));
      handleResumeUpload(file);
    }
  };

  const handleNameChange = (e) => {
    setLocalData(prev => ({ ...prev, fullName: e.target.value }));
  };
  
  const handleSkillsChange = (selectedOptions) => {
    setLocalData(prev => ({ ...prev, skills: selectedOptions || [] }));
  };

  const handleInputChange = (section, e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({
        ...prev,
        education: { ...prev.education, [section]: { ...prev.education[section], [name]: value } }
    }));
  };

  const handleQualificationChange = (section, selectedOption) => {
    setLocalData(prev => ({
      ...prev,
      education: { ...prev.education, [section]: { ...prev.education[section], qualification: selectedOption } }
    }));
  };
  
  const handleEducationFileChange = (section, e) => {
    const file = e.target.files[0];
    if (file) {
        setLocalData(prev => ({
            ...prev,
            education: { ...prev.education, [section]: { ...prev.education[section], marksheet: file } }
        }));
    }
  };

  const handleNext = () => {
    updateFormData('resumeDetails', localData);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Resume and Education</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Upload Resume</label>
        <label htmlFor="resume" className="mt-1 cursor-pointer flex items-center justify-center w-full px-3 py-4 border border-gray-400 border-dashed rounded-md bg-gray-50 hover:bg-gray-100">
          <span className="text-indigo-600 font-medium">
            {localData.resumeFile ? `Selected: ${localData.resumeFile.name}` : 'Click to upload resume to auto-fill'}
          </span>
          <input id="resume" name="resume" type="file" onChange={handleFileChange} className="sr-only" />
        </label>
        {isParsing && <p className="text-center text-blue-600 mt-2">🔍 Parsing your resume and extracting details...</p>}
        {isParsingSkills && <p className="text-center text-indigo-600 mt-2">✨ Auto-filling skills and education from resume...</p>}
        {error && <p className="text-center text-red-600 mt-2">{error}</p>}
      </div>

      {localData.resumeFile && (
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              value={localData.fullName} 
              onChange={handleNameChange}
              placeholder={isParsing ? "Parsing..." : "Enter your full name"} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills {isParsingSkills && <span className="text-blue-600 text-xs">(Auto-filling from resume...)</span>}
            </label>
            <CreatableSelect
              isMulti
              value={localData.skills}
              onChange={handleSkillsChange}
              options={[]}
              placeholder={isParsingSkills ? "Auto-filling skills from resume..." : "Select or type your skills..."}
              className="basic-multi-select"
              classNamePrefix="select"
              isDisabled={isParsingSkills}
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              noOptionsMessage={() => "Type to add custom skills"}
            />
            <p className="mt-1 text-xs text-gray-500">
              ✨ Auto-extracted from your resume. You can add, edit, or remove skills.
            </p>
            {localData.skills.length > 0 && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✅ {localData.skills.length} skills detected
              </div>
            )}
          </div>
          
          <EducationSection title="Degree" sectionKey="degree" data={localData.education.degree || {}} handleInputChange={handleInputChange} handleFileChange={handleEducationFileChange} handleQualificationChange={handleQualificationChange} />
          <EducationSection title="12th / Diploma" sectionKey="twelfth" data={localData.education.twelfth || {}} handleInputChange={handleInputChange} handleFileChange={handleEducationFileChange} handleQualificationChange={handleQualificationChange} />
          <EducationSection title="10th Grade" sectionKey="tenth" data={localData.education.tenth || {}} handleInputChange={handleInputChange} handleFileChange={handleEducationFileChange} handleQualificationChange={handleQualificationChange} />
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Back</button>
        <button onClick={handleNext} disabled={!isFormComplete} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  );
};

export default UploadResume;