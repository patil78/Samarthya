import React, { useState } from 'react';
import EditJobModal from './EditJobModal';

const PostedJobsList = ({ jobs, onDelete, onRefresh }) => {
  const [editingJob, setEditingJob] = useState(null);

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-gray-600">No job postings yet. Click "Post New Job" to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Posted Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.job_id} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-indigo-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-indigo-800">{job.role || 'N/A'}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingJob(job)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(job.job_id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">{job.sector_name || 'N/A'}</p>
              <p className="text-sm text-gray-500 mb-3">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location || 'N/A'}
              </p>
              
              <div className="border-t pt-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stipend:</span>
                  <span className="font-semibold">₹{job.stipend || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vacancies:</span>
                  <span className="font-semibold">{job.vacancies || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Education:</span>
                  <span className="font-semibold">{job.education_required || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{job.duration || 'N/A'}</span>
                </div>
                {job.min_score && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Score:</span>
                    <span className="font-semibold">{job.min_score}/100</span>
                  </div>
                )}
              </div>

              {/* Skills Section */}
              {job.skills_required && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-gray-600 text-sm font-medium">Required Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills_required.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Section */}
              {job.description && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-gray-600 text-sm font-medium">Description:</span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                    {job.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={() => {
            setEditingJob(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
};

export default PostedJobsList;
