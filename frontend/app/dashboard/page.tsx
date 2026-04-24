'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase, Clock, CheckCircle, XCircle,
  BookmarkCheck, TrendingUp, ArrowRight, Loader2,
  Building2, MapPin, AlertCircle,
} from 'lucide-react';
import { applicationsAPI, usersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Application, Job } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  reviewing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shortlisted: 'bg-purple-50 text-purple-700 border border-purple-200',
  interview: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  offered: 'bg-green-50 text-green-700 border border-green-200',
  hired: 'bg-green-100 text-green-800 border border-green-300',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  withdrawn: 'bg-gray-100 text-gray-600 border border-gray-200',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'jobseeker') {
      fetchData();
    } else if (isAuthenticated && user?.role === 'employer') {
      router.push('/employer/dashboard');
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, savedRes] = await Promise.all([
        applicationsAPI.getMyApplications(),
        usersAPI.getSavedJobs(),
      ]);
      setApplications(appsRes.data.applications);
      setSavedJobs(savedRes.data.savedJobs);
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      await applicationsAPI.withdraw(id);
      setApplications(applications.map(app =>
        app._id === id ? { ...app, status: 'withdrawn' as const } : app
      ));
    } catch {
      console.error('Failed to withdraw');
    }
  };

  const stats = [
    { label: 'Total Applied', value: applications.length, icon: Briefcase, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'In Progress', value: applications.filter(a => ['reviewing', 'shortlisted', 'interview'].includes(a.status)).length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Offers', value: applications.filter(a => ['offered', 'hired'].includes(a.status)).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Saved Jobs', value: savedJobs.length, icon: BookmarkCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 px-4 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-purple-200">Track your job applications and saved jobs</p>
          </div>
          <Link
            href="/jobs"
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            Find Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'applications'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved Jobs ({savedJobs.length})
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-6">Start applying to jobs to track your progress here</p>
                <Link href="/jobs" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2">
                  Browse Jobs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const job = app.job as unknown as Job;
                  return (
                    <div key={app._id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{job?.title || 'Job Title'}</h3>
                            <p className="text-gray-500 text-sm mb-2">{(job?.company as unknown as { name: string })?.name || 'Company'}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Applied {timeAgo(app.createdAt)}</span>
                              {job?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[app.status]}`}>
                            {app.status}
                          </span>
                          {!['hired', 'rejected', 'withdrawn'].includes(app.status) && (
                            <button onClick={() => handleWithdraw(app._id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                      {app.status === 'interview' && app.interviewDate && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-sm text-indigo-600">
                          <AlertCircle className="w-4 h-4" />
                          Interview: {new Date(app.interviewDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Saved Jobs Tab */}
        {activeTab === 'saved' && (
          <div>
            {savedJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
                <p className="text-gray-500 mb-6">Save jobs you're interested in to revisit them later</p>
                <Link href="/jobs" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2">
                  Browse Jobs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <Link key={job._id} href={`/jobs/${job.slug}`}>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-gray-500 text-sm mb-2">{job.company?.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full capitalize font-medium">{job.jobType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}