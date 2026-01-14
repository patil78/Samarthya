// This object is now built directly from your database screenshots
export const jobPreferencesData = {
  "Conglomerate": {
    "Analyst Intern": ["Mumbai, Maharashtra"],
    "Business Intern": ["Mumbai, Maharashtra"]
  },
  "Energy": {
    "Engineering Intern": ["New Delhi, Delhi", "Gurugram, Haryana", "Duliajan, Assam", "Mumbai, Maharashtra"]
  },
  "Telecom": {
    "Tech Intern": ["Mumbai, Maharashtra"]
  },
  "IT/Consulting": {
    "Tech Intern": ["Mumbai, Maharashtra", "Bengaluru, Karnataka", "Noida, Uttar Pradesh", "Hyderabad, Telangana", "Pune, Maharashtra"],
    "Software Intern": ["Bengaluru, Karnataka"]
  },
  "Banking & Finance": {
    "Finance Intern": ["Mumbai, Maharashtra", "New Delhi, Delhi"]
  },
  "Energy/Oil & Gas": {
    "Engineering Intern": ["Dehradun, Uttarakhand"]
  },
  "Energy/Power": {
      // No specific roles for this sector in the opportunities table yet
  },
  "Manufacturing": {
    "Operations Intern": ["Jamshedpur, Jharkhand", "Mumbai, Maharashtra", "New Delhi, Delhi"]
  },
  "FMCG": {
    "Marketing Intern": ["Kolkata, West Bengal", "Mumbai, Maharashtra"]
  },
  "Mining": {
    "Operations Intern": ["Udaipur, Rajasthan", "Sambalpur, Odisha", "Singrauli, Madhya Pradesh"],
    "Engineering Intern": ["Hyderabad, Telangana"]
  },
  "Finance": {
    "Finance Intern": ["New Delhi, Delhi"]
  },
  "Engineering/Construction": {
    "Engineering Intern": ["Mumbai, Maharashtra"]
  },
  "Retail": {
    "Retail Intern": ["Mumbai, Maharashtra"]
  }
};

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// --- HELPER FUNCTIONS (Updated to fetch from backend) ---

/**
 * Get sector options from local data (synchronous)
 */
export const getSectorOptionsSync = () => {
  return Object.keys(jobPreferencesData).map(sector => ({
    value: sector,
    label: sector
  }));
};

/**
 * Get role options for a sector from local data (synchronous)
 */
export const getRoleOptionsSync = (sector) => {
  if (!sector || !jobPreferencesData[sector]) return [];
  return Object.keys(jobPreferencesData[sector]).map(role => ({
    value: role,
    label: role
  }));
};

/**
 * Get location options for a sector and role from local data (synchronous)
 */
export const getLocationOptionsSync = (sector, role) => {
  if (!sector || !role || !jobPreferencesData[sector] || !jobPreferencesData[sector][role]) {
    return [];
  }
  return jobPreferencesData[sector][role].map(location => ({
    value: location,
    label: location
  }));
};

/**
 * Fetch all available sectors from the backend
 */
export const getSectorOptions = async () => {
  try {
    const response = await fetch(`${API_URL}/api/sectors`);
    if (!response.ok) {
      throw new Error('Failed to fetch sectors');
    }
    const data = await response.json();
    return data.sectors || [];
  } catch (error) {
    console.error('Error fetching sectors:', error);
    // Fallback to local data
    return getSectorOptionsSync();
  }
};

/**
 * Fetch roles for a specific sector from the backend
 */
export const getRoleOptions = async (sector) => {
  if (!sector) return [];
  
  try {
    const response = await fetch(`${API_URL}/api/roles?sector=${encodeURIComponent(sector)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    const data = await response.json();
    return data.roles || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    // Fallback to local data
    return getRoleOptionsSync(sector);
  }
};

/**
 * Fetch locations for a specific sector and role from the backend
 */
export const getLocationOptions = async (sector, role) => {
  if (!sector || !role) return [];
  
  try {
    const response = await fetch(
      `${API_URL}/api/locations?sector=${encodeURIComponent(sector)}&role=${encodeURIComponent(role)}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    const data = await response.json();
    return data.locations || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    // Fallback to local data
    return getLocationOptionsSync(sector, role);
  }
};

