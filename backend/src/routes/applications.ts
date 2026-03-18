import { Router } from 'express';
import {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
  getJobApplications,
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('jobseeker'), applyToJob);
router.get('/my', authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplications);
router.patch('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);
router.patch('/:id/withdraw', authorize('jobseeker'), withdrawApplication);

export default router;