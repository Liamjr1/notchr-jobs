import { Router } from 'express';
import {
  getJobs,
  getJobBySlug,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getFeaturedJobs,
  getCategories,
} from '../controllers/jobController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getCategories);
router.get('/employer', authenticate, authorize('employer', 'admin'), getEmployerJobs);
router.get('/:slug', optionalAuth, getJobBySlug);

router.post('/', authenticate, authorize('employer', 'admin'), createJob);
router.patch('/:id', authenticate, authorize('employer', 'admin'), updateJob);
router.delete('/:id', authenticate, authorize('employer', 'admin'), deleteJob);

export default router;