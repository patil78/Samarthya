import React, { useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import { getSectorOptionsSync, getRoleOptionsSync } from '../../data/jobPreferencesData';
import { skillOptions } from '../../data/skillsData';

const API_BASE_URL = 'http://localhost:8000';

const educationOptions = [
  { value: 'PG', label: 'Postgraduate (PG)' },
  { value: 'UG', label: 'Undergraduate (UG)' },
  { value: 'Diploma', label: 'Diploma' },
];

const durationOptions = [
  { value: '1 month', label: '1 month' },
  { value: '2 months', label: '2 months' },
  { value: '3 months', label: '3 months' },
  { value: '6 months', label: '6 months' },
  { value: '12 months', label: '12 months' },
];

const JobPostingFormNew = ({ orgId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    sector: null,
    role: null,
    location: '',
    stipend: '',
    vacancies: 1,
    education: null,
    duration: null,
    minScore: '',
    skills: [],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with orgId:', orgId);
    console.log('Form data:', formData);
    
    if (!orgId) {
      setError('Organization ID not found. Please log in again.');
      return;
    }
    
    if (!formData.sector || !formData.role) {
      setError('Please select both sector and role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('sector_name', formData.sector.value);
      payload.append('role', formData.role.value);
      payload.append('location', formData.location);
      payload.append('stipend', formData.stipend);
      payload.append('vacancies', formData.vacancies);
      payload.append('education_required', formData.education?.value || '');
      payload.append('duration', formData.duration?.value || '');
      payload.append('min_score', formData.minScore || '');
      
      // Add skills as comma-separated string or JSON
      const skillsString = formData.skills.map(skill => skill.value).join(', ');
      payload.append('skills_required', skillsString);
      
      // Add description
      payload.append('description', formData.description || '');

      console.log('Sending POST request to:', `${API_BASE_URL}/organization/${orgId}/sectors`);

      const response = await axios.post(
        `${API_BASE_URL}/organization/${orgId}/sectors`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Response:', response.data);
      alert('Job posted successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error posting job:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const sectorOptions = getSectorOptionsSync();
  const roleOptions = getRoleOptionsSync(formData.sector?.value);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Post New Job Opportunity</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sector and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector <span className="text-red-500">*</span>
                </label>
                <Select
                  options={sectorOptions}
                  value={formData.sector}
                  onChange={(opt) => handleSelectChange('sector', opt)}
                  placeholder="Select sector..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Offered <span className="text-red-500">*</span>
                </label>
                <Select
                  options={roleOptions}
                  value={formData.role}
                  onChange={(opt) => handleSelectChange('role', opt)}
                  placeholder="Select role..."
                  isDisabled={!formData.sector}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Job Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Stipend and Vacancies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 mb-1">
                  Stipend (per month)
                </label>
                <input
                  type="number"
                  id="stipend"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleInputChange}
                  placeholder="25000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="vacancies" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Vacancies <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="vacancies"
                  name="vacancies"
                  value={formData.vacancies}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Education and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Education
                </label>
                <Select
                  options={educationOptions}
                  value={formData.education}
                  onChange={(opt) => handleSelectChange('education', opt)}
                  placeholder="Select education level..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internship Duration
                </label>
                <Select
                  options={durationOptions}
                  value={formData.duration}
                  onChange={(opt) => handleSelectChange('duration', opt)}
                  placeholder="Select duration..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            {/* Minimum Score */}
            <div>
              <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Eligibility Score (0-100)
              </label>
              <input
                type="number"
                id="minScore"
                name="minScore"
                value={formData.minScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Students with scores below this threshold will not be allocated to this position
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills
              </label>
              <CreatableSelect
                isMulti
                options={skillOptions}
                value={formData.skills}
                onChange={(selected) => handleSelectChange('skills', selected)}
                placeholder="Select or type skills..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <p className="mt-1 text-sm text-gray-500">
                Select from existing skills or type to add custom skills
              </p>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about the role, responsibilities, and requirements..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPostingFormNew;
