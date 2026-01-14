// This array now contains the exact list of sectors you provided.
export const sectorOptions = [
  { value: 'IT', label: 'IT/Consulting' },
  { value: 'Finance', label: 'Banking & Finance' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Congo', label: 'Conglomerate' },
  { value: 'EN', label: 'Energy' },
  { value: 'Tele', label: 'Telecom' },
  { value: 'EN/OIL', label: 'Energy/Oil & Gas' },
  { value: 'EN/POW', label: 'Energy/Power' },
  { value: 'MIN', label: 'Mining' },
  { value: 'FM', label: 'FMCG' },
  { value: 'RET', label: 'Retail' },
];

// This helper function makes the options available to your components.
export const getSectorOptions = () => sectorOptions;

// The keys in this object have been updated to match the 'value' from the sectorOptions above.
export const rolesBySector = {
  IT: [
    { value: 'frontend_dev', label: 'Frontend Developer' },
    { value: 'backend_dev', label: 'Backend Developer' },
    { value: 'fullstack_dev', label: 'Full Stack Developer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'qa', label: 'QA Engineer' },
  ],
  Finance: [
    { value: 'financial_analyst', label: 'Financial Analyst' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'investment_banker', label: 'Investment Banker' },
  ],
  Manufacturing: [
    { value: 'mechanical_engineer', label: 'Mechanical Engineer' },
    { value: 'production_manager', label: 'Production Manager' },
  ],
  Congo: [
      { value: 'business_dev', label: 'Business Development' },
      { value: 'strategy_manager', label: 'Strategy Manager' },
  ],
  EN: [
      { value: 'project_engineer', label: 'Project Engineer' },
      { value: 'renewables_specialist', label: 'Renewables Specialist' },
  ],
  Tele: [
      { value: 'network_engineer', label: 'Network Engineer' },
      { value: 'telecom_analyst', label: 'Telecom Analyst' },
  ],
  'EN/OIL': [
      { value: 'petroleum_engineer', label: 'Petroleum Engineer' },
      { value: 'geologist', label: 'Geologist' },
  ],
  'EN/POW': [
      { value: 'power_plant_operator', label: 'Power Plant Operator' },
      { value: 'grid_manager', label: 'Grid Manager' },
  ],
  MIN: [
      { value: 'mining_engineer', label: 'Mining Engineer' },
      { value: 'geotechnical_engineer', label: 'Geotechnical Engineer' },
  ],
  FM: [
      { value: 'brand_manager', label: 'Brand Manager' },
      { value: 'market_research', label: 'Market Research Analyst' },
  ],
  RET: [
      { value: 'store_manager', label: 'Store Manager' },
      { value: 'merchandiser', label: 'Merchandiser' },
  ],
};

// --- Helper functions for components ---

export const getRoleOptions = (sector) => {
  if (!sector || !rolesBySector[sector]) return [];
  return rolesBySector[sector];
};

export const getLocationOptions = (sector, role) => {
    // This function can be expanded later to have specific locations per role
    const allLocations = [
        { value: 'Pune', label: 'Pune' },
        { value: 'Mumbai', label: 'Mumbai' },
        { value: 'Bengaluru', label: 'Bengaluru' },
        { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'Chennai', label: 'Chennai' },
        { value: 'Gurugram', label: 'Gurugram' },
    ];
    if (!sector || !role) return [];
    return allLocations;
};