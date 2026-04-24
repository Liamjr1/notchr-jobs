'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, MapPin, Briefcase, Clock, Building2, Loader2
} from 'lucide-react';
import { jobsAPI } from '@/lib/api';
import { Job } from '@/types';

const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote'];
const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive'];
const categories = ['Technology', 'Finance', 'Marketing', 'Design', 'Sales', 'Healthcare', 'Education', 'Engineering'];

const jobTypeBadgeColors: Record<string, string> = {
  'full-time': 'bg-purple-100 text-purple-700',
  'part-time': 'bg-orange-100 text-orange-700',
  'contract': 'bg-blue-100 text-blue-700',
  'freelance': 'bg-green-100 text-green-700',
  'internship': 'bg-gray-100 text-gray-600',
  'remote': 'bg-teal-100 text-teal-700',
};

function formatSalary(salary?: Job['salary']) {
  if (!salary) return null;
  if (salary.isNegotiable) return 'Negotiable';
  if (salary.min && salary.max) return `₦${(salary.min / 1000).toFixed(0)}k - ₦${(salary.max / 1000).toFixed(0)}k`;
  return null;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: '',
    experienceLevel: '',
    isRemote: '',
  });

  const fetchJobs = async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: currentPage.toString(), limit: '12' };
      if (filters.q) params.q = filters.q;
      if (filters.location) params.location = filters.location;
      if (filters.category) params.category = filters.category;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.isRemote) params.isRemote = filters.isRemote;
      const response = await jobsAPI.getJobs(params);
      setJobs(response.data.jobs);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.pages);
    } catch {
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(page); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Next Job</h1>
          <p className="text-purple-200 mb-6">Discover opportunities across Nigeria</p>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 flex-1">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title or keyword..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 flex-1">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
              />
            </div>
            <button type="submit" className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 py-3 rounded-xl transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setFilters({ q: '', location: '', category: '', jobType: '', experienceLevel: '', isRemote: '' })}
                  className="text-purple-700 text-sm hover:text-purple-800 font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => setFilters({ ...filters, category: cat })}
                        className="accent-purple-700"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Job Type</h3>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="jobType"
                        checked={filters.jobType === type}
                        onChange={() => setFilters({ ...filters, jobType: type })}
                        className="accent-purple-700"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Experience</h3>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="experienceLevel"
                        checked={filters.experienceLevel === level}
                        onChange={() => setFilters({ ...filters, experienceLevel: level })}
                        className="accent-purple-700"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remote */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isRemote === 'true'}
                    onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked ? 'true' : '' })}
                    className="accent-purple-700"
                  />
                  <span className="text-sm text-gray-600">Remote only</span>
                </label>
              </div>

              <button
                onClick={() => fetchJobs(1)}
                className="w-full mt-6 bg-purple-700 hover:bg-purple-800 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Jobs List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{total}</span> jobs found
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link key={job._id} href={`/jobs/${job.slug}`}>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                            {job.company?.logo ? (
                              <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Building2 className="w-6 h-6 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 hover:text-purple-700 transition-colors">{job.title}</h3>
                              {job.urgent && <span className="bg-red-50 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">Urgent</span>}
                              {job.featured && <span className="bg-yellow-50 text-yellow-600 text-xs font-medium px-2 py-0.5 rounded-full">Featured</span>}
                            </div>
                            <p className="text-gray-500 text-sm mb-3">{job.company?.name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(job.createdAt)}</span>
                              {formatSalary(job.salary) && (
                                <span className="text-green-600 font-semibold">{formatSalary(job.salary)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full capitalize ${jobTypeBadgeColors[job.jobType] || 'bg-gray-100 text-gray-600'}`}>
                          {job.jobType}
                        </span>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-100">{skill}</span>
                          ))}
                          {job.skills.length > 4 && <span className="text-gray-400 text-xs px-3 py-1">+{job.skills.length - 4} more</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">Previous</button>
                <span className="text-gray-600 px-4">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}