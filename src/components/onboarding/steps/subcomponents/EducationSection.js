import React from 'react';
import Select from 'react-select';

const allQualificationOptions = [
  { value: 'PG', label: 'Postgraduate (PG)' },
  { value: 'UG', label: 'Undergraduate (UG)' },
  { value: 'Diploma', label: 'Diploma' },
];

const twelfthQualificationOptions = [
    { value: '12th', label: '12th Grade / HSC' },
    { value: 'Diploma', label: 'Diploma' },
];

const EducationSection = ({ title, data, handleInputChange, handleFileChange, handleQualificationChange, sectionKey }) => {
  const qualificationOptions = title === '12th / Diploma' ? twelfthQualificationOptions : allQualificationOptions;
  
  return (
    <div className="border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {title !== '10th Grade' && (
          <div>
            <label htmlFor={`${sectionKey}_qualification`} className="block text-sm font-medium text-gray-700">Qualification</label>
            <Select
              id={`${sectionKey}_qualification`}
              options={qualificationOptions}
              value={data.qualification}
              onChange={(option) => handleQualificationChange(sectionKey, option)}
              className="mt-1"
            />
          </div>
        )}

        <div>
          <label htmlFor={`${sectionKey}_college_name`} className="block text-sm font-medium text-gray-700">School/College Name</label>
          <input 
            type="text" 
            id={`${sectionKey}_college_name`} 
            name="college_name" 
            value={data.college_name || ''} 
            onChange={(e) => handleInputChange(sectionKey, e)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
          />
        </div>

        <div>
          <label htmlFor={`${sectionKey}_address`} className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" id={`${sectionKey}_address`} name="address" value={data.address || ''} onChange={(e) => handleInputChange(sectionKey, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        
        <div>
          <label htmlFor={`${sectionKey}_degree`} className="block text-sm font-medium text-gray-700">Degree/Board</label>
          <input type="text" id={`${sectionKey}_degree`} name="degree" value={data.degree || ''} onChange={(e) => handleInputChange(sectionKey, e)} placeholder={title === '10th Grade' ? 'e.g., CBSE, SSC' : 'e.g., HSC, B.Tech'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        
        {title !== '10th Grade' && (
          <div>
            <label htmlFor={`${sectionKey}_branch`} className="block text-sm font-medium text-gray-700">Branch/Stream</label>
            <input 
              type="text" 
              id={`${sectionKey}_branch`} 
              name="branch" 
              value={data.branch || ''} 
              onChange={(e) => handleInputChange(sectionKey, e)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
        )}

        <div>
          <label htmlFor={`${sectionKey}_cgpa`} className="block text-sm font-medium text-gray-700">CGPA / Percentage</label>
          <input 
            type="text" 
            id={`${sectionKey}_cgpa`} 
            name="cgpa" 
            value={data.cgpa || ''} 
            onChange={(e) => handleInputChange(sectionKey, e)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
          />
        </div>
        
        <div>
          <label htmlFor={`${sectionKey}_passing_year`} className="block text-sm font-medium text-gray-700">Passing Year</label>
          <input 
            type="text" 
            id={`${sectionKey}_passing_year`} 
            name="passing_year" 
            value={data.passing_year || ''} 
            onChange={(e) => handleInputChange(sectionKey, e)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
          />
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Upload Marksheet</label>
            <label htmlFor={`${sectionKey}_marksheet`} className="mt-1 cursor-pointer flex items-center justify-center w-full px-3 py-2 border border-gray-400 border-dashed rounded-md bg-gray-50 hover:bg-gray-100">
            <span className="text-indigo-600 font-medium">
                {data.marksheet ? `Selected: ${data.marksheet.name}` : 'Click to select marksheet file'}
            </span>
            <input id={`${sectionKey}_marksheet`} name="marksheet" type="file" onChange={(e) => handleFileChange(sectionKey, e)} className="sr-only" />
            </label>
        </div>
      </div>
    </div>
  );
};

export default EducationSection;