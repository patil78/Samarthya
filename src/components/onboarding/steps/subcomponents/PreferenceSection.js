import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getSectorOptions, getRoleOptions, getLocationOptions } from '../../../../data/jobPreferencesData';

// We now accept 'usedLocations' as a prop
const PreferenceSection = ({ preference, onPreferenceChange, index, usedLocations }) => {
  
  const [sectorOptions, setSectorOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch sectors on component mount
  useEffect(() => {
    const fetchSectors = async () => {
      const sectors = await getSectorOptions();
      setSectorOptions(sectors);
    };
    fetchSectors();
  }, []);

  // Fetch roles when sector changes
  useEffect(() => {
    const fetchRoles = async () => {
      if (preference.sector?.value) {
        setLoadingRoles(true);
        const roles = await getRoleOptions(preference.sector.value);
        setRoleOptions(roles);
        setLoadingRoles(false);
      } else {
        setRoleOptions([]);
      }
    };
    fetchRoles();
  }, [preference.sector]);

  // Fetch locations when sector or role changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (preference.sector?.value && preference.role?.value) {
        setLoadingLocations(true);
        const locations = await getLocationOptions(preference.sector.value, preference.role.value);
        setLocationOptions(locations);
        setLoadingLocations(false);
      } else {
        setLocationOptions([]);
      }
    };
    fetchLocations();
  }, [preference.sector, preference.role]);

  return (
    <div className="border p-4 rounded-lg space-y-4 bg-gray-50">
      <h3 className="font-semibold text-lg text-gray-800">Preference {index + 1}</h3>
      
      {/* Sector and Role Dropdowns are unchanged */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
        <Select
          options={sectorOptions}
          value={preference.sector}
          onChange={(selectedOption) => onPreferenceChange(index, 'sector', selectedOption)}
          placeholder="Select a sector..."
          isClearable
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Role (select one)</label>
        <Select
          options={roleOptions}
          value={preference.role}
          onChange={(selectedOption) => onPreferenceChange(index, 'role', selectedOption)}
          isDisabled={!preference.sector}
          isLoading={loadingRoles}
          placeholder={preference.sector ? "Select a role..." : "Select a sector first"}
          isClearable
        />
      </div>

      {/* Location Dropdown (Updated with isOptionDisabled) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location (select one)</label>
        <Select
          options={locationOptions}
          value={preference.location}
          onChange={(selectedOption) => onPreferenceChange(index, 'location', selectedOption)}
          isDisabled={!preference.role}
          isLoading={loadingLocations}
          placeholder={preference.role ? "Select one location..." : "Select a role first"}
          isClearable
          // ✅ This function checks each option. If its value is in the usedLocations
          // array, it returns true, which disables the option.
          isOptionDisabled={(option) => usedLocations.includes(option.value)}
        />
      </div>
    </div>
  );
};

export default PreferenceSection;