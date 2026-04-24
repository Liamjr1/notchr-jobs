'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Clock, Briefcase, Building2, Users,
  CheckCircle, ArrowLeft, Loader2, BookmarkPlus,
  ExternalLink, AlertCircle,
} from 'lucide-react';
import { jobsAPI, applicationsAPI, usersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Job } from '@/types';
import toast from 'react-hot-toast';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function formatSalary(salary?: Job['salary']) {
  if (!salary) return null;
  if (salary.isNegotiable) return 'Negotiable';
  if (salary.min && salary.max) return `₦${(salary.min / 1000).toFixed(0)}k - ₦${(salary.max / 1000).toFixed(0)}k per ${salary.period}`;
  return null;
}

export default function JobDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getJobBySlug(slug as string);
        setJob(response.data.job);
      } catch {
        toast.error('Job not found');
        router.push('/jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push('/login'); return; }
    setIsApplying(true);
    try {
      await applicationsAPI.apply({ jobId: job!._id, coverLetter });
      setHasApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted successfully!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setIsSaving(true);
    try {
      await usersAPI.saveJob(job!._id);
      toast.success('Job saved!');
    } catch {
      toast.error('Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                {job.urgent ? <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Urgent</span> : null}
                {job.featured ? <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">Featured</span> : null}
              </div>
              <Link href={`/companies/${job.company?.slug}`} className="text-purple-200 hover:text-white font-medium transition-colors">
                {job.company?.name}
              </Link>
              <div className="flex flex-wrap gap-4 text-sm text-purple-200 mt-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> <span className="capitalize">{job.jobType}</span></span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> <span className="capitalize">{job.experienceLevel} level</span></span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Posted {timeAgo(job.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Apply Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              {formatSalary(job.salary) ? (
                <div className="bg-green-50 text-green-700 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mb-4 border border-green-100">
                  💰 {formatSalary(job.salary)}
                </div>
              ) : null}
              <div className="flex gap-3">
                {hasApplied ? (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-6 py-2.5 rounded-xl font-semibold border border-green-100">
                    <CheckCircle className="w-4 h-4" /> Applied Successfully
                  </div>
                ) : user?.role === 'jobseeker' || !isAuthenticated ? (
                  <button
                    onClick={() => isAuthenticated ? setShowApplyForm(!showApplyForm) : router.push('/login')}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Apply Now
                  </button>
                ) : null}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <BookmarkPlus className="w-4 h-4" /> Save Job
                </button>
              </div>

              {showApplyForm && (
                <form onSubmit={handleApply} className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Submit Application</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Letter (optional)</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the employer why you're a great fit..."
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={isApplying} className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 disabled:opacity-50">
                      {isApplying ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
                    </button>
                    <button type="button" onClick={() => setShowApplyForm(false)} className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
                <ul className="space-y-3">
                  {job.benefits.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Job Overview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-gray-700 font-semibold">{job.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Job Type</p>
                  <p className="text-gray-700 font-semibold capitalize">{job.jobType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Experience</p>
                  <p className="text-gray-700 font-semibold capitalize">{job.experienceLevel} level</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-gray-700 font-semibold">{job.location}</p>
                </div>
                {job.deadline ? (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Deadline</p>
                    <p className="text-red-600 font-semibold">{new Date(job.deadline).toLocaleDateString()}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Applications</p>
                  <p className="text-gray-700 font-semibold">{job.applicationCount} applied</p>
                </div>
              </div>
            </div>

            {job.skills && job.skills.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="bg-purple-50 text-purple-700 text-sm px-3 py-1.5 rounded-lg font-medium border border-purple-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {job.company ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">About the Company</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{job.company.name}</p>
                    <p className="text-gray-500 text-sm">{job.company.location}</p>
                  </div>
                </div>
                <Link
                  href={`/companies/${job.company.slug}`}
                  className="w-full border border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" /> View Company
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}