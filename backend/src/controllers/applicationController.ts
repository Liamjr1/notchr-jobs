import { Response } from 'express';
import { z } from 'zod';
import Application from '../models/Application';
import Job, { IJob } from '../models/Job';
import { AuthRequest } from '../middleware/auth';

const applicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = applicationSchema.parse(req.body);

    const job = await Job.findById(data.jobId);
    if (!job || job.status !== 'active') {
      res.status(404).json({ error: 'Job not found or no longer active' });
      return;
    }

    if (job.deadline && new Date() > job.deadline) {
      res.status(400).json({ error: 'Application deadline has passed' });
      return;
    }

    const existing = await Application.findOne({
      job: data.jobId,
      applicant: req.user?._id,
    });
    if (existing) {
      res.status(400).json({ error: 'You have already applied for this job' });
      return;
    }

    const application = await Application.create({
      job: data.jobId,
      applicant: req.user?._id,
      company: job.company,
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl,
    });

    await Job.findByIdAndUpdate(data.jobId, { $inc: { applicationCount: 1 } });

    const populated = await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'company', select: 'name logo' },
    ]);

    res.status(201).json({ application: populated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.issues });
      return;
    }
    if ((error as { code?: number }).code === 11000) {
      res.status(400).json({ error: 'You have already applied for this job' });
      return;
    }
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { applicant: req.user?._id };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          select: 'title slug jobType location salary deadline',
          populate: { path: 'company', select: 'name logo' },
        })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Application.countDocuments(filter),
    ]);

    res.json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, notes, interviewDate } = req.body;
    const application = await Application.findById(req.params.id).populate<{ job: IJob }>('job');

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (
      application.job.postedBy.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      },
      { new: true }
    );

    res.json({ application: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update application' });
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.applicant.toString() !== req.user?._id.toString()) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      res.status(400).json({ error: 'Cannot withdraw application at this stage' });
      return;
    }

    await Application.findByIdAndUpdate(req.params.id, {
      status: 'withdrawn',
      withdrawnAt: new Date(),
    });

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

    res.json({ message: 'Application withdrawn successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const filter: Record<string, unknown> = { job: req.params.jobId };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'firstName lastName email avatar phone skills bio resumeUrl')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Application.countDocuments(filter),
    ]);

    res.json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};