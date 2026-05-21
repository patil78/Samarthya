import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
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
  
  const [sectorOptions, setSectorOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddSector, setShowAddSector] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newSector, setNewSector] = useState('');
  const [newRole, setNewRole] = useState('');
  const [addingData, setAddingData] = useState(false);

  // Load sectors on component mount
  useEffect(() => {
    fetchSectors();
  }, []);

  // Load roles when sector changes
  useEffect(() => {
    if (formData.sector) {
      fetchRoles(formData.sector.value);
      setFormData(prev => ({ ...prev, role: null })); // Reset role when sector changes
    } else {
      setRoleOptions([]);
    }
  }, [formData.sector]);

  const fetchSectors = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/organization/${orgId}/available-sectors`
      );
      const formattedSectors = response.data.sectors.map(sector => ({
        value: sector.value,
        label: sector.label
      }));
      setSectorOptions(formattedSectors);
    } catch (err) {
      console.error('Error fetching sectors:', err);
      setError('Failed to load sectors');
    }
  };

  const fetchRoles = async (sectorId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/organization/${orgId}/available-roles?sector_id=${sectorId}`
      );
      const formattedRoles = response.data.roles.map(role => ({
        value: role.value,
        label: role.label
      }));
      setRoleOptions(formattedRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles');
    }
  };

  const handleAddSector = async () => {
    if (!newSector.trim()) {
      setError('Please enter a sector name');
      return;
    }

    setAddingData(true);
    setError('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('sector_name', newSector.trim());

      const response = await axios.post(
        `${API_BASE_URL}/organization/${orgId}/create-sector`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Add the new sector to the list
      const newSectorOption = {
        value: response.data.sector_id,
        label: response.data.sector_name
      };
      setSectorOptions([...sectorOptions, newSectorOption]);
      setFormData(prev => ({ ...prev, sector: newSectorOption }));
      
      setShowAddSector(false);
      setNewSector('');
      alert(`✅ Sector "${response.data.sector_name}" created successfully!`);
    } catch (err) {
      console.error('Error creating sector:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create sector';
      setError(errorMsg);
    } finally {
      setAddingData(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError('Please enter a role name');
      return;
    }

    if (!formData.sector) {
      setError('Please select a sector first');
      return;
    }

    setAddingData(true);
    setError('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('role_name', newRole.trim());
      formDataObj.append('sector_name', formData.sector.label);

      const response = await axios.post(
        `${API_BASE_URL}/organization/${orgId}/create-role`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Add the new role to the list
      const newRoleOption = {
        value: response.data.role_id,
        label: response.data.role_name
      };
      setRoleOptions([...roleOptions, newRoleOption]);
      setFormData(prev => ({ ...prev, role: newRoleOption }));
      
      setShowAddRole(false);
      setNewRole('');
      alert(`✅ Role "${response.data.role_name}" created successfully!`);
    } catch (err) {
      console.error('Error creating role:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create role';
      setError(errorMsg);
    } finally {
      setAddingData(false);
    }
  };

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
                <button
                  type="button"
                  onClick={() => setShowAddSector(!showAddSector)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ➕ Can't find your sector? Create new
                </button>

                {showAddSector && (
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                    <input
                      type="text"
                      placeholder="Enter sector name (e.g., Blockchain)"
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleAddSector}
                        disabled={addingData}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
                      >
                        {addingData ? 'Creating...' : 'Create Sector'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSector(false);
                          setNewSector('');
                        }}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
                <button
                  type="button"
                  onClick={() => setShowAddRole(!showAddRole)}
                  disabled={!formData.sector}
                  className={`mt-2 text-sm font-medium ${
                    formData.sector
                      ? 'text-indigo-600 hover:text-indigo-800'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ➕ Can't find your role? Create new
                </button>

                {showAddRole && (
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                    <input
                      type="text"
                      placeholder="Enter role name (e.g., Smart Contract Developer)"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleAddRole}
                        disabled={addingData}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
                      >
                        {addingData ? 'Creating...' : 'Create Role'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRole(false);
                          setNewRole('');
                        }}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
