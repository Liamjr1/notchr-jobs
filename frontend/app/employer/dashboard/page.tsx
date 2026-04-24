'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase, Users, Eye, Plus,
  Building2, ArrowRight, Loader2,
  CheckCircle, Clock, TrendingUp,
} from 'lucide-react';
import { jobsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Job } from '@/types';

const statusColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border border-green-200',
  paused: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  closed: 'bg-red-50 text-red-700 border border-red-200',
  draft: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export default function EmployerDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!authLoading && isAuthenticated && user?.role !== 'employer' && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'employer' || user?.role === 'admin')) fetchJobs();
  }, [isAuthenticated, user]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsAPI.getEmployerJobs();
      setJobs(response.data.jobs);
    } catch {
      console.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsAPI.deleteJob(id);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch {
      console.error('Failed to delete job');
    }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    try {
      await jobsAPI.updateJob(job._id, { status: newStatus });
      setJobs(jobs.map((j) => j._id === job._id ? { ...j, status: newStatus as Job['status'] } : j));
    } catch {
      console.error('Failed to update job');
    }
  };

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Active Jobs', value: jobs.filter(j => j.status === 'active').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Applications', value: jobs.reduce((acc, j) => acc + j.applicationCount, 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Views', value: jobs.reduce((acc, j) => acc + j.views, 0), icon: Eye, color: 'text-orange-600', bg: 'bg-orange-50' },
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
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 px-4 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Employer Dashboard 👔</h1>
            <p className="text-purple-200">Manage your job postings and applications</p>
          </div>
          <Link
            href="/employer/post-job"
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post a Job
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

        {/* Jobs List */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg">Your Job Postings</h2>
            <Link href="/employer/post-job" className="text-purple-700 hover:text-purple-800 text-sm font-semibold inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add New
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-6">Start attracting talent by posting your first job</p>
              <Link href="/employer/post-job" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {job.applicationCount} applications</span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {job.views} views</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {job.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <Link
                        href={`/employer/applications/${job._id}`}
                        className="text-sm text-purple-700 hover:text-purple-800 border border-purple-200 hover:border-purple-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        View Apps <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}