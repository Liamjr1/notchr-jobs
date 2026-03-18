import { Router, Response } from 'express';
import User from '../models/User';
import Job from '../models/Job';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.patch('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'location',
      'bio', 'skills', 'resumeUrl', 'linkedinUrl', 'avatar',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Save a job
router.post('/saved-jobs/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const jobId = req.params.jobId as string;
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const savedSet = new Set(user.savedJobs?.map((id) => id.toString()) || []);
    let action: string;

    if (savedSet.has(jobId)) {
      user.savedJobs = user.savedJobs?.filter((id) => id.toString() !== jobId);
      action = 'removed';
    } else {
      user.savedJobs = [...(user.savedJobs || []), jobExists._id];
      action = 'saved';
    }

    await user.save({ validateBeforeSave: false });
    res.json({ action, savedJobs: user.savedJobs });
  } catch {
    res.status(500).json({ error: 'Failed to update saved jobs' });
  }
});

// Get saved jobs
router.get('/saved-jobs', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo location isVerified' },
    });
    res.json({ savedJobs: user?.savedJobs || [] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

export default router;