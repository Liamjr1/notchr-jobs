import { Request, Response } from 'express';
import { z } from 'zod';
import Job from '../models/Job';
import Company from '../models/Company';
import { AuthRequest } from '../middleware/auth';

const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
  '-' + Math.random().toString(36).slice(2, 7);

const jobSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50),
  requirements: z.array(z.string()).optional().default([]),
  responsibilities: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  location: z.string().min(2),
  country: z.string().default('Nigeria'),
  state: z.string().optional(),
  city: z.string().optional(),
  isRemote: z.boolean().default(false),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('NGN'),
    period: z.enum(['monthly', 'annual']).default('annual'),
    isNegotiable: z.boolean().default(false),
  }).optional(),
  deadline: z.string().optional(),
  category: z.string().min(2),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().default(false),
  urgent: z.boolean().default(false),
  companyId: z.string(),
});

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q, category, jobType, experienceLevel, location,
      isRemote, featured, page = '1', limit = '20',
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { status: 'active' };

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter.location = new RegExp(location, 'i');
    if (isRemote === 'true') filter.isRemote = true;
    if (featured === 'true') filter.featured = true;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', 'name logo location isVerified')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJobBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findOne({ slug: req.params.slug, status: 'active' })
      .populate('company')
      .populate('postedBy', 'firstName lastName');

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    await Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } });

    res.json({ job });
  } catch {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = jobSchema.parse(req.body);

    const company = await Company.findById(data.companyId);
    if (!company || company.owner.toString() !== req.user?._id.toString()) {
      res.status(403).json({ error: 'Not authorized to post for this company' });
      return;
    }

    const job = await Job.create({
      ...data,
      slug: slugify(data.title),
      company: data.companyId,
      postedBy: req.user?._id,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    const populatedJob = await job.populate('company', 'name logo location');
    res.status(201).json({ job: populatedJob });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('company', 'name logo');

    res.json({ job: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

export const getEmployerJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companies = await Company.find({ owner: req.user?._id }).select('_id');
    const companyIds = companies.map((c) => c._id);

    const jobs = await Job.find({ company: { $in: companyIds } })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch {
    res.status(500).json({ error: 'Failed to fetch employer jobs' });
  }
};

export const getFeaturedJobs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ status: 'active', featured: true })
      .populate('company', 'name logo location isVerified')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ jobs });
  } catch {
    res.status(500).json({ error: 'Failed to fetch featured jobs' });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ categories });
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};