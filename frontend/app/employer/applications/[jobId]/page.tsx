'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, User, Mail, Phone,
  MapPin, FileText, ExternalLink, CheckCircle,
  XCircle, Clock, TrendingUp,
} from 'lucide-react';
import { applicationsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Application } from '@/types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-50 text-blue-700' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-50 text-purple-700' },
  { value: 'interview', label: 'Interview', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'offered', label: 'Offered', color: 'bg-green-50 text-green-700' },
  { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700' },
];

export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated) fetchApplications();
  }, [isAuthenticated, filterStatus]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const response = await applicationsAPI.getJobApplications(jobId as string);
      setApplications(response.data.applications);
    } catch {
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: string) => {
    try {
      await applicationsAPI.updateStatus(appId, { status });
      setApplications(applications.map(app =>
        app._id === appId ? { ...app, status: status as Application['status'] } : app
      ));
      if (selectedApp?._id === appId) {
        setSelectedApp({ ...selectedApp, status: status as Application['status'] });
      }
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-600';
  };

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 mt-1">
              {applications.length} total applications
            </p>
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Applications List */}
          <div className="lg:w-96 shrink-0">
            {applications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const applicant = app.applicant as unknown as {
                    firstName: string;
                    lastName: string;
                    email: string;
                    avatar?: string;
                    skills?: string[];
                  };
                  return (
                    <div
                      key={app._id}
                      onClick={() => setSelectedApp(app)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedApp?._id === app._id
                          ? 'border-blue-300 shadow-md'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-purple-700 font-semibold text-sm">
                              {applicant?.firstName?.[0]}{applicant?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {applicant?.firstName} {applicant?.lastName}
                            </p>
                            <p className="text-gray-400 text-xs">{timeAgo(app.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Application Detail */}
          <div className="flex-1">
            {!selectedApp ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select an application to view details</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                {(() => {
                  const applicant = selectedApp.applicant as unknown as {
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone?: string;
                    location?: string;
                    bio?: string;
                    skills?: string[];
                    resumeUrl?: string;
                    linkedinUrl?: string;
                  };
                  return (
                    <>
                      {/* Applicant Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-700 font-bold text-xl">
                              {applicant?.firstName?.[0]}{applicant?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              {applicant?.firstName} {applicant?.lastName}
                            </h2>
                            <p className="text-gray-500 text-sm">
                              Applied {new Date(selectedApp.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedApp.status)}`}>
                          {selectedApp.status}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        {applicant?.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {applicant.email}
                          </div>
                        )}
                        {applicant?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {applicant.phone}
                          </div>
                        )}
                        {applicant?.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {applicant.location}
                          </div>
                        )}
                        {applicant?.resumeUrl ? (
                          <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-purple-700 hover:text-blue-700">
                            <ExternalLink className="w-4 h-4" />
                            View Resume
                          </a>
                        ) : null}
                      </div>

                      {/* Bio */}
                      {applicant?.bio && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{applicant.bio}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {applicant?.skills && applicant.skills.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {applicant.skills.map(skill => (
                              <span key={skill} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-lg">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cover Letter */}
                      {selectedApp.coverLetter && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl whitespace-pre-line">
                            {selectedApp.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Update Status */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => handleStatusUpdate(selectedApp._id, option.value)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                                selectedApp.status === option.value
                                  ? `${option.color} border-current`
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}