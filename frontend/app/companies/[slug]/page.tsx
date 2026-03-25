'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, MapPin, Users, Globe, Linkedin,
  Twitter, ArrowLeft, Loader2, CheckCircle,
  Briefcase, Calendar, Clock,
} from 'lucide-react';
import { companiesAPI } from '@/lib/api';
import { Company, Job } from '@/types';
import toast from 'react-hot-toast';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await companiesAPI.getCompanyBySlug(slug as string);
        setCompany(response.data.company);
        setJobs(response.data.jobs);
      } catch {
        toast.error('Company not found');
        router.push('/companies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/companies" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                    {company.isVerified ? (
                      <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : null}
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{company.industry}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {company.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {company.size} employees
                    </span>
                    {company.founded ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Founded {company.founded}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-4 py-2 rounded-lg transition-colors">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                ) : null}
                
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {company.name}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{company.description}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Open Positions ({jobs.length})</h2>
              {jobs.length === 0 ? (
                <div className="text-center py-10">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No open positions at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link key={job._id} href={`/jobs/${job.slug}`}>
                      <div className="border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{job.title}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {timeAgo(job.createdAt)}
                              </span>
                            </div>
                          </div>
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full capitalize shrink-0">{job.jobType}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Company Info</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Industry</p>
                  <p className="text-gray-700 font-medium">{company.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Company Size</p>
                  <p className="text-gray-700 font-medium">{company.size} employees</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-gray-700 font-medium">{company.location}</p>
                </div>
                {company.founded ? (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Founded</p>
                    <p className="text-gray-700 font-medium">{company.founded}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Open Jobs</p>
                  <p className="text-gray-700 font-medium">{jobs.length} positions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}