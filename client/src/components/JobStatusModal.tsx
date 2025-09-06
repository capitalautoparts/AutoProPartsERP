import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import { jobsApi } from '../services/api';
import { ImportJob, ExportJob } from '../types';

interface JobStatusModalProps {
  jobId: string;
  jobType: 'import' | 'export';
  onClose: () => void;
}

const JobStatusModal: React.FC<JobStatusModalProps> = ({ jobId, jobType, onClose }) => {
  const { data: job, refetch } = useQuery({
    queryKey: ['job', jobType, jobId],
    queryFn: () => jobType === 'import' 
      ? jobsApi.getImportJob(jobId).then(res => res.data)
      : jobsApi.getExportJob(jobId).then(res => res.data),
    refetchInterval: job?.status === 'pending' || job?.status === 'processing' ? 2000 : false,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'processing':
        return 'text-blue-700 bg-blue-100';
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (!job) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">Loading job status...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {jobType === 'import' ? 'Import' : 'Export'} Job Status
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-4">
              {getStatusIcon(job.status)}
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                {job.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">File Name</label>
                <p className="text-sm text-gray-900">{job.fileName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900">{job.type.toUpperCase()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Module</label>
                <p className="text-sm text-gray-900">{job.module}</p>
              </div>

              {jobType === 'import' && (job as ImportJob).recordsProcessed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Records Processed</label>
                  <p className="text-sm text-gray-900">
                    {(job as ImportJob).recordsProcessed} / {(job as ImportJob).totalRecords || 'Unknown'}
                  </p>
                </div>
              )}

              {job.status === 'completed' && jobType === 'export' && (job as ExportJob).downloadUrl && (
                <div>
                  <a
                    href={(job as ExportJob).downloadUrl}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    download
                  >
                    Download File
                  </a>
                </div>
              )}

              {job.status === 'failed' && (job as ImportJob).errors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Errors</label>
                  <div className="text-sm text-red-600">
                    {(job as ImportJob).errors?.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(job.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStatusModal;