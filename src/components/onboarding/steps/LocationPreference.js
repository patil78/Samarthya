import React from 'react';
import PreferenceSection from './subcomponents/PreferenceSection';

const LocationPreference = ({ data, updateFormData, nextStep, prevStep }) => {
  const [preferences, setPreferences] = React.useState(
    data.preferences || [
      { id: 1, sector: null, role: null, location: null },
      { id: 2, sector: null, role: null, location: null },
      { id: 3, sector: null, role: null, location: null },
      { id: 4, sector: null, role: null, location: null },
      { id: 5, sector: null, role: null, location: null },
    ]
  );

  const handlePreferenceChange = (index, field, value) => {
    const newPreferences = [...preferences];
    newPreferences[index] = { ...newPreferences[index], [field]: value };
    
    if (field === 'sector') {
      newPreferences[index].role = null;
      newPreferences[index].location = null;
    }
    if (field === 'role') {
        newPreferences[index].location = null;
    }

    setPreferences(newPreferences);
  };

  const handleNext = () => {
    const filledPreferences = preferences.filter(p => p.sector && p.role);
    updateFormData('preferences', filledPreferences);
    nextStep();
  };
  
  const isFormComplete = preferences.some(p => p.sector && p.role && p.location);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Job Preferences</h2>
      <p className="text-sm text-gray-500 mb-6">Fill out at least one preference to proceed. Locations already selected for the same role will be disabled.</p>
      
      <div className="space-y-6">
        {preferences.map((pref, index) => {
          // ✅ START: New logic to find used locations
          // This function finds all locations that have been selected in OTHER preference
          // slots that have the SAME sector and role as the current one.
          const getUsedLocations = () => {
            if (!pref.sector || !pref.role) return [];
            
            return preferences
              .filter((p, i) => 
                i !== index && // Exclude the current preference section
                p.sector?.value === pref.sector.value &&
                p.role?.value === pref.role.value
              )
              .map(p => p.location?.value) // Get just the location value (e.g., "Pune")
              .filter(Boolean); // Remove any empty/null values
          };

          const usedLocations = getUsedLocations();
          // ✅ END: New logic

          return (
            <PreferenceSection
              key={pref.id}
              index={index}
              preference={pref}
              onPreferenceChange={handlePreferenceChange}
              usedLocations={usedLocations} // Pass the list of used locations as a prop
            />
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Back</button>
        <button 
          onClick={handleNext} 
          disabled={!isFormComplete}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LocationPreference;