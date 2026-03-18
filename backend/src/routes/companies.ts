import { Router, Request, Response } from 'express';
import Company from '../models/Company';
import Job from '../models/Job';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const slugify = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
  '-' + Math.random().toString(36).slice(2, 6);

const companySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(20),
  industry: z.string(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  location: z.string(),
  country: z.string().default('Nigeria'),
  state: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  founded: z.union([z.number(), z.string()]).transform(val => val ? Number(val) : undefined).optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  logo: z.string().optional(),
});

// Get all companies
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, industry, page = '1', limit = '12' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { isActive: true };
    if (q) filter.$text = { $search: q };
    if (industry) filter.industry = industry;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .select('-owner')
        .sort({ isVerified: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Company.countDocuments(filter),
    ]);

    res.json({
      companies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true });
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const jobs = await Job.find({ company: company._id, status: 'active' })
      .sort({ featured: -1, createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ company, jobs });
  } catch {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
router.post('/', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const data = companySchema.parse(req.body);
    const company = await Company.create({
      ...data,
      slug: slugify(data.name),
      owner: req.user?._id,
    });
    res.status(201).json({ company });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.patch('/:id', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    if (company.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ company: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Get my companies
router.get('/my/companies', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const companies = await Company.find({ owner: req.user?._id });
    res.json({ companies });
  } catch {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

export default router;