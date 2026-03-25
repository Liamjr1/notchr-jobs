export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'jobseeker' | 'employer' | 'admin';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  location: string;
  country: string;
  state?: string;
  city?: string;
  founded?: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Salary {
  min?: number;
  max?: number;
  currency: string;
  period: 'monthly' | 'annual';
  isNegotiable: boolean;
}

export interface Job {
  _id: string;
  title: string;
  slug: string;
  company: Company;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'remote';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  country: string;
  isRemote: boolean;
  salary?: Salary;
  deadline?: string;
  status: 'active' | 'paused' | 'closed' | 'draft';
  views: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  tags: string[];
  category: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  job: Job;
  applicant: User;
  company: Company;
  coverLetter?: string;
  resumeUrl?: string;
  status:
    | 'pending'
    | 'reviewing'
    | 'shortlisted'
    | 'interview'
    | 'offered'
    | 'hired'
    | 'rejected'
    | 'withdrawn';
  notes?: string;
  interviewDate?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface JobFilters {
  q?: string;
  category?: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  isRemote?: string;
  page?: string;
  limit?: string;
}