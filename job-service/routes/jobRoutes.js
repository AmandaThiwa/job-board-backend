import express from 'express';
import { 
    getJobs, getJobById, createJob, updateJob, deleteJob,getJobsByCompanyId, getMyJobs
} from '../controllers/jobController.js';
import { protect, companyOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
// Protected route for a company to view their own jobs
router.get('/myjobs', protect, companyOnly, getMyJobs);

// Public route to view jobs by a specific company ID
router.get('/company/:companyId', getJobsByCompanyId);
// Public routes (Anyone can view jobs)
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (Only companies can post, update, or delete)
router.post('/', protect, companyOnly, createJob);
router.put('/:id', protect, companyOnly, updateJob);
router.delete('/:id', protect, companyOnly, deleteJob);

export default router;